# frozen_string_literal: true

module ForemanAnsibleDirector
  module Actions
    module AnsibleContentUnit
      module DestroyProviders
        module Git
          class DestroyFull < ::ForemanAnsibleDirector::Actions::Base::AnsibleDirectorAction
            input_format do
              param :unit_id
              param :unit_version_id
            end

            def plan(args)
              unit_version_id = args[:unit_version_id]

              cuv = ::ForemanAnsibleDirector::ContentUnitVersion.find_by(id: unit_version_id)

              concurrence do
                plan_action(::ForemanAnsibleDirector::Actions::Pulp3::Ansible::Repository::Destroy,
                  repository_href: cuv.pulp_repository_href)
                plan_action(::ForemanAnsibleDirector::Actions::Pulp3::Ansible::Distribution::Destroy,
                  distribution_href: cuv.pulp_distribution_href)

                plan_action(::ForemanAnsibleDirector::Actions::Pulp3::Ansible::Remote::Git::Destroy,
                  git_remote_href: cuv.pulp_remote_href)
              end
            end
          end
        end
      end
    end
  end
end
