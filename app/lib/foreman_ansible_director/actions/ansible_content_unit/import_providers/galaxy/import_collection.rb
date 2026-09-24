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

              repository_href = repository_create_action.output['repository_create_response']['pulp_href']
              distribution_href = distribution_create_action.output['distribution_create_response']['pulp_href']
              remote_href = collection_remote_create_action.output['collection_remote_create_response']['pulp_href']

              cleanup_check = plan_action(
                ::ForemanAnsibleDirector::Actions::Rescue::AnsibleContentUnit::Common::CleanupCheck,
                repository_create_action: repository_create_action.output,
                distribution_create_action: distribution_create_action.output,
                remote_create_action: collection_remote_create_action.output
              )

              plan_action(::ForemanAnsibleDirector::Actions::AnsibleContentUnit::ImportProviders::Galaxy::Rescue,
                repository_href: repository_href,
                distribution_href: distribution_href,
                remote_href: remote_href,
                skip_repository_cleanup: cleanup_check.output[:skip_repository_cleanup],
                skip_distribution_cleanup: cleanup_check.output[:skip_distribution_cleanup],
                skip_remote_cleanup: cleanup_check.output[:skip_remote_cleanup],
                pulp_failure: cleanup_check.output[:pulp_failure])

              _sync_action = plan_action(
                ::ForemanAnsibleDirector::Actions::Pulp3::Ansible::Repository::Sync,
                repository_href: repository_href,
                remote_href: remote_href
              )

              index_action = plan_action(
                ::ForemanAnsibleDirector::Actions::AnsibleContentUnit::Index::IndexStatic,
                index_mode: 'import',
                repository_href: repository_href,
                remote_href: remote_href,
                distribution_href: distribution_href,
                content_unit_type: unit.unit_type,
                content_unit_source: unit.source,
                unit_name: unit.unit_name,
                unit_namespace: unit.unit_namespace,
                organization_id: organization_id
              )

              plan_action(
                ::ForemanAnsibleDirector::Actions::AnsibleContentUnit::ImportProviders::Galaxy::VerifyCollectionImport,
                requirements: unit.collection_file,
                unit_namespace: unit.unit_namespace,
                unit_name: unit.unit_name,
                indexed_unit_versions: index_action.output[:indexed_unit_versions]
              )

              # Nothing was successfully imported (e.g. every requested collection/version was
              # invalid). The Pulp objects created for this import attempt are now orphaned under a
              # deterministic name - schedule their clean up so a later import of the same unit
              # does not collide with that name. This does not fail the import itself; that is
              # handled separately by VerifyCollectionImport raising its own warning above.
              #
              # This is derived here (via #plan_self), rather than read from VerifyCollectionImport's
              # output, because VerifyCollectionImport's #rescue_strategy_for_self is Skip: Dynflow
              # silently skips (never runs) any action that depends on the output of a step that ends
              # up skipped, which would mean this cleanup never runs for exactly the case it exists
              # for. #plan_self never raises, so nothing depending on it can be skipped this way.
              cleanup_decision = plan_self(indexed_unit_versions: index_action.output[:indexed_unit_versions])

              plan_action(::ForemanAnsibleDirector::Actions::AnsibleContentUnit::ImportProviders::Galaxy::Rescue,
                repository_href: repository_href,
                distribution_href: distribution_href,
                remote_href: remote_href,
                skip_repository_cleanup: cleanup_decision.output[:skip_cleanup],
                skip_distribution_cleanup: cleanup_decision.output[:skip_cleanup],
                skip_remote_cleanup: cleanup_decision.output[:skip_cleanup],
                pulp_failure: false)
            end

            def run
              output.update(skip_cleanup: !input[:indexed_unit_versions].empty?)
            end
          end
        end
      end
    end
  end
end
