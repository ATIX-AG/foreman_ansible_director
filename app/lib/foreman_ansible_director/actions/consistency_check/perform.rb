# frozen_string_literal: true

module ForemanAnsibleDirector
  module Actions
    module ConsistencyCheck
      class Perform < ::ForemanAnsibleDirector::Actions::Base::AnsibleDirectorAction
        include Dynflow::Action::V2::WithSubPlans

        input_format do
        end

        output_format do
        end

        # We'll have to see whether Pulp can handle this kind of request spam.
        # If not, we have to use sequential execution and/or rate-limit requests.
        def plan(*_args)
          repo_check_action = plan_action(
            ::ForemanAnsibleDirector::Actions::ConsistencyCheck::Check::Repositories
          )
          distribution_check_action = plan_action(
            ::ForemanAnsibleDirector::Actions::ConsistencyCheck::Check::Distributions
          )
          collection_remote_check_action = plan_action(
            ::ForemanAnsibleDirector::Actions::ConsistencyCheck::Check::CollectionRemotes
          )
          role_remote_check_action = plan_action(
            ::ForemanAnsibleDirector::Actions::ConsistencyCheck::Check::RoleRemotes
          )
          git_remote_check_action = plan_action(
            ::ForemanAnsibleDirector::Actions::ConsistencyCheck::Check::GitRemotes
          )

          plan_self(
            unreferenced_repository_hrefs:
              repo_check_action.output[:unreferenced_repository_hrefs],
            unreferenced_distribution_hrefs:
              distribution_check_action.output[:unreferenced_distribution_hrefs],
            unreferenced_collection_remote_hrefs:
              collection_remote_check_action.output[:unreferenced_collection_remote_hrefs],
            unreferenced_role_remote_hrefs:
              role_remote_check_action.output[:unreferenced_role_remote_hrefs],
            unreferenced_git_remote_hrefs:
              git_remote_check_action.output[:unreferenced_git_remote_hrefs]
          )
        end

        def total_count
          1
        end

        def create_sub_plans
          unreferenced_repository_hrefs = input[:unreferenced_repository_hrefs]
          unreferenced_distribution_hrefs = input[:unreferenced_distribution_hrefs]
          unreferenced_collection_remote_hrefs = input[:unreferenced_collection_remote_hrefs]
          unreferenced_role_remote_hrefs = input[:unreferenced_role_remote_hrefs]
          unreferenced_git_remote_hrefs = input[:unreferenced_git_remote_hrefs]

          trigger(
            ::ForemanAnsibleDirector::Actions::ConsistencyCheck::Destroy::Repositories,
            unreferenced_repository_hrefs: unreferenced_repository_hrefs
          )
          trigger(
            ::ForemanAnsibleDirector::Actions::ConsistencyCheck::Destroy::Distributions,
            unreferenced_distribution_hrefs: unreferenced_distribution_hrefs
          )
          trigger(
            ::ForemanAnsibleDirector::Actions::ConsistencyCheck::Destroy::CollectionRemotes,
            unreferenced_collection_remote_hrefs: unreferenced_collection_remote_hrefs
          )
          trigger(
            ::ForemanAnsibleDirector::Actions::ConsistencyCheck::Destroy::RoleRemotes,
            unreferenced_role_remote_hrefs: unreferenced_role_remote_hrefs
          )
          trigger(
            ::ForemanAnsibleDirector::Actions::ConsistencyCheck::Destroy::GitRemotes,
            unreferenced_git_remote_hrefs: unreferenced_git_remote_hrefs
          )
        end
      end
    end
  end
end
