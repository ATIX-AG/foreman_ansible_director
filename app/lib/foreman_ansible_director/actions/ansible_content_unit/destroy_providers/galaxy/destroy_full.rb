# frozen_string_literal: true

module ForemanAnsibleDirector
  module Actions
    module AnsibleContentUnit
      module DestroyProviders
        module Galaxy
          class DestroyFull < ::ForemanAnsibleDirector::Actions::Base::AnsibleDirectorAction
            input_format do
              param :unit_id
              param :unit_version_ids
            end

            def plan(args)
              unit_id = args[:unit_id]

              # Since Pulp objects are the same for content imported from Galaxy, any CUV will do
              cuv = ::ForemanAnsibleDirector::ContentUnitVersion.where(
                versionable_id: unit_id,
                source_type: 'galaxy'
              ).includes(:versionable).first

              concurrence do
                plan_action(::ForemanAnsibleDirector::Actions::Pulp3::Ansible::Repository::Destroy,
                  repository_href: cuv.pulp_repository_href)
                plan_action(::ForemanAnsibleDirector::Actions::Pulp3::Ansible::Distribution::Destroy,
                  distribution_href: cuv.pulp_distribution_href)

                if cuv.versionable.collection?
                  plan_action(::ForemanAnsibleDirector::Actions::Pulp3::Ansible::Remote::Collection::Destroy,
                    collection_remote_href: cuv.pulp_remote_href)
                else
                  plan_action(::ForemanAnsibleDirector::Actions::Pulp3::Ansible::Remote::Role::Destroy,
                    role_remote_href: cuv.pulp_remote_href)
                end
              end
            end
          end
        end
      end
    end
  end
end
