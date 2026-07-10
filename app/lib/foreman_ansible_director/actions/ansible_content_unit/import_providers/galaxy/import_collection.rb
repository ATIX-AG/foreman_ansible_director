# frozen_string_literal: true

module ForemanAnsibleDirector
  module Actions
    module AnsibleContentUnit
      module ImportProviders
        module Galaxy
          class ImportCollection < ::ForemanAnsibleDirector::Actions::Base::AnsibleDirectorAction
            input_format do
              param :unit, Object, required: true # SimpleAnsibleContentUnit
              param :organization_id, required: true
            end

            def plan(args)
              unit = args[:unit]
              organization_id = args[:organization_id]

              repository_create_action = plan_action(
                ::ForemanAnsibleDirector::Actions::Pulp3::Ansible::Repository::Create,
                name: "#{organization_id}-galaxy-#{unit.name}"
              )

              distribution_create_action = plan_action(
                ::ForemanAnsibleDirector::Actions::Pulp3::Ansible::Distribution::Create,
                name: "#{organization_id}-galaxy-#{unit.name}",
                base_path: "#{organization_id}/#{unit.name}-galaxy",
                repository_create_action: repository_create_action.output
              )

              collection_remote_create_action = plan_action(
                ::ForemanAnsibleDirector::Actions::Pulp3::Ansible::Remote::Collection::Create,
                name: "#{organization_id}-galaxy-#{unit.name}",
                url: unit.source,
                requirements: unit.collection_file
              )

              cleanup_check = plan_action(
                ::ForemanAnsibleDirector::Actions::Rescue::AnsibleContentUnit::Common::CleanupCheck,
                repository_create_action: repository_create_action.output,
                distribution_create_action: distribution_create_action.output,
                remote_create_action: collection_remote_create_action.output
              )

              plan_action(::ForemanAnsibleDirector::Actions::AnsibleContentUnit::ImportProviders::Galaxy::Rescue,
                repository_create_action: repository_create_action.output,
                distribution_create_action: distribution_create_action.output,
                collection_remote_create_action: collection_remote_create_action.output,
                skip_repository_cleanup: cleanup_check.output[:skip_repository_cleanup],
                skip_distribution_cleanup: cleanup_check.output[:skip_distribution_cleanup],
                skip_remote_cleanup: cleanup_check.output[:skip_remote_cleanup],
                pulp_failure: cleanup_check.output[:pulp_failure])

              remote_href = collection_remote_create_action.output['collection_remote_create_response']['pulp_href']

              _snyc_action = plan_action(
                ::ForemanAnsibleDirector::Actions::Pulp3::Ansible::Repository::Sync,
                repository_href: repository_create_action.output['repository_create_response']['pulp_href'],
                remote_href: remote_href
              )

              _index_action = plan_action(
                ::ForemanAnsibleDirector::Actions::AnsibleContentUnit::Index::IndexStatic,
                index_mode: 'import',
                repository_href: repository_create_action.output['repository_create_response']['pulp_href'],
                remote_href: remote_href,
                distribution_href: distribution_create_action.output['distribution_create_response']['pulp_href'],
                content_unit_type: unit.unit_type,
                content_unit_source: unit.source,
                unit_name: unit.unit_name,
                unit_namespace: unit.unit_namespace,
                organization_id: organization_id
              )
            end
          end
        end
      end
    end
  end
end
