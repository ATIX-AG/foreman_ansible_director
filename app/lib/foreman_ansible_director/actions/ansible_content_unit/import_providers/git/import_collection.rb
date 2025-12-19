# frozen_string_literal: true

module ForemanAnsibleDirector
  module Actions
    module AnsibleContentUnit
      module ImportProviders
        module Git
          class ImportCollection < ::ForemanAnsibleDirector::Actions::Base::AnsibleDirectorAction
            input_format do
              param :unit, Object, required: true # SimpleAnsibleContentUnit
              param :unit_version, String, required: true
              param :git_ls_remote, Hash, required: true
              param :organization_id, required: true
            end

            def plan(args)
              unit = args[:unit]
              organization_id = args[:organization_id]
              unit_version = args[:unit_version]

              repository_create_action = plan_action(
                ::ForemanAnsibleDirector::Actions::Pulp3::Ansible::Repository::Create,
                name: "#{organization_id}-#{unit.name}"
              )

              distribution_create_action = plan_action(
                ::ForemanAnsibleDirector::Actions::Pulp3::Ansible::Distribution::Create,
                name: unit.name,
                base_path: "#{organization_id}/#{unit.name}",
                repository_href: repository_create_action.output['repository_create_response']['pulp_href']
              )

              git_remote_create_action = plan_action(
                ::ForemanAnsibleDirector::Actions::Pulp3::Ansible::Remote::Git::Create,
                name: unit.name,
                url: unit.source,
                git_ref: unit_version
              )

              remote_href = git_remote_create_action.output['git_remote_create_response']['pulp_href']

              _snyc_action = plan_action(
                ::ForemanAnsibleDirector::Actions::Pulp3::Ansible::Repository::Sync,
                repository_href: repository_create_action.output['repository_create_response']['pulp_href'],
                remote_href: remote_href
              )

              _index_action = plan_action(
                Index,
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
