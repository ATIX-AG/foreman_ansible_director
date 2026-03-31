# frozen_string_literal: true

module ForemanAnsibleDirector
  module Actions
    module AnsibleContentUnit
      module DestroyProviders
        module Galaxy
          class DestroyPartial < ::ForemanAnsibleDirector::Actions::Base::AnsibleDirectorAction
            input_format do
              param :unit_id
              param :unit_version_ids # []
            end

            def plan(args)
              unit_version_ids = args[:unit_version_ids]

              cuvs = ::ForemanAnsibleDirector::ContentUnitVersion.where(id: unit_version_ids)

              versions_to_remove = cuvs.pluck(:version)
              partial_scu = Struct.new(:versions).new(versions_to_remove)

              # Shared between all versions_to_remove
              cuv = cuvs[0]
              acu = cuv.versionable

              new_requirements = acu.requirements_file(partial_scu, subtractive: true)
              remote_href = cuv.pulp_remote_href
              repository_href = cuv.pulp_repository_href

              _remote_update_action = plan_action(
                ::ForemanAnsibleDirector::Actions::Pulp3::Ansible::Remote::Collection::Update,
                collection_remote_href: remote_href,
                requirements: new_requirements
              )
              _snyc_action = plan_action(
                ::ForemanAnsibleDirector::Actions::Pulp3::Ansible::Repository::Sync,
                repository_href: repository_href,
                remote_href: remote_href
              )

              plan_self(unit_version_ids: unit_version_ids)
            end

            def finalize
              unit_version_ids = input[:unit_version_ids]
              ::ForemanAnsibleDirector::ContentUnitVersion.where(id: unit_version_ids).destroy_all
            end
          end
        end
      end
    end
  end
end
