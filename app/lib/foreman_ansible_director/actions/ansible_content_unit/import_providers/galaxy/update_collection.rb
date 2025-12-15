# frozen_string_literal: true

module ForemanAnsibleDirector
  module Actions
    module AnsibleContentUnit
      module ImportProviders
        module Galaxy
          class UpdateCollection < ::ForemanAnsibleDirector::Actions::Base::AnsibleDirectorAction
            input_format do
              param :unit, Object, required: true # SimpleAnsibleContentUnit
              param :organization_id, required: true
            end

            def plan(args)
              unit = args[:unit]
              organization_id = args[:organization_id]

              existing_unit = ::ForemanAnsibleDirector::AnsibleCollection.find_by(
                namespace: unit.unit_namespace,
                name: unit.unit_name,
                organization_id: organization_id
              )

              repository_href = existing_unit.pulp_repository_href
              remote_href = existing_unit.pulp_remote_href
              distribution_href = existing_unit.pulp_distribution_href

              sequence do
                _remote_update_action = plan_action(
                  ::ForemanAnsibleDirector::Actions::Pulp3::Ansible::Remote::Collection::Update,
                  collection_remote_href: remote_href,
                  requirements: existing_unit.requirements_file(unit)
                )

                _snyc_action = plan_action(
                  ::ForemanAnsibleDirector::Actions::Pulp3::Ansible::Repository::Sync,
                  repository_href: repository_href,
                  remote_href: remote_href
                )

                _index_action = plan_action(
                  Index,
                  index_mode: 'update',
                  repository_href: repository_href,
                  remote_href: remote_href,
                  distribution_href: distribution_href,
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
end
