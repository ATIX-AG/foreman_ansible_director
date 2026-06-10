# frozen_string_literal: true

module ForemanAnsibleDirector
  module Actions
    module AnsibleContentUnit
      module ImportProviders
        module Galaxy
          class UpdateCollection < ::ForemanAnsibleDirector::Actions::Base::AnsibleDirectorAction
            input_format do
              param :unit, Object, required: true # SimpleAnsibleContentUnit
              param :content_unit_id, String, required: true
              param :organization_id, required: true
            end

            def plan(args)
              existing_unit = ::ForemanAnsibleDirector::AnsibleCollection.find_by(id: args[:content_unit_id])
              new_unit = args[:unit]
              organization_id = args[:organization_id]

              # For collections coming from Ansible Galaxy, we can reuse the existing Pulp objects
              repository_href = existing_unit
                                .content_unit_versions
                                .where(source_type: 'galaxy')
                                .first
                                .pulp_repository_href
              remote_href = existing_unit.content_unit_versions
                                         .where(source_type: 'galaxy')
                                         .first
                                         .pulp_remote_href
              distribution_href = existing_unit.content_unit_versions
                                               .where(source_type: 'galaxy')
                                               .first
                                               .pulp_distribution_href

              sequence do
                _remote_update_action = plan_action(
                  ::ForemanAnsibleDirector::Actions::Pulp3::Ansible::Remote::Collection::Update,
                  collection_remote_href: remote_href,
                  requirements: existing_unit.requirements_file(new_unit)
                )

                _snyc_action = plan_action(
                  ::ForemanAnsibleDirector::Actions::Pulp3::Ansible::Repository::Sync,
                  repository_href: repository_href,
                  remote_href: remote_href
                )

                _index_action = plan_action(
                  ::ForemanAnsibleDirector::Actions::AnsibleContentUnit::Index::IndexStatic,
                  index_mode: 'update',
                  repository_href: repository_href,
                  remote_href: remote_href,
                  distribution_href: distribution_href,
                  content_unit_type: new_unit.unit_type,
                  content_unit_source: new_unit.source,
                  content_unit_id: args[:content_unit_id],
                  unit_name: new_unit.unit_name,
                  unit_namespace: new_unit.unit_namespace,
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
