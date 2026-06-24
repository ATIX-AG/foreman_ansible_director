# frozen_string_literal: true

module ForemanAnsibleDirector
  module Actions
    module Pulp3
      module Util
        # Helper action used by the cleanup_pulp_objects rake task. Not used in business logic.
        class DestroyAll < ::ForemanAnsibleDirector::Actions::Base::AnsibleDirectorAction
          include Dynflow::Action::V2::WithSubPlans

          input_format do
          end

          output_format do
          end

          def plan(*_args)
            repo_list_action = plan_action(
              ::ForemanAnsibleDirector::Actions::Pulp3::Ansible::Repository::ListAll
            )
            distribution_list_action = plan_action(
              ::ForemanAnsibleDirector::Actions::Pulp3::Ansible::Distribution::ListAll
            )
            collection_remote_list_action = plan_action(
              ::ForemanAnsibleDirector::Actions::Pulp3::Ansible::Remote::Collection::ListAll
            )
            role_remote_list_action = plan_action(
              ::ForemanAnsibleDirector::Actions::Pulp3::Ansible::Remote::Role::ListAll
            )
            git_remote_list_action = plan_action(
              ::ForemanAnsibleDirector::Actions::Pulp3::Ansible::Remote::Git::ListAll
            )

            plan_self(
              repository_hrefs:
                repo_list_action.output[:repository_list_response],
              distribution_hrefs:
                distribution_list_action.output[:distribution_list_response],
              collection_remote_hrefs:
                collection_remote_list_action.output[:collection_remote_list_response],
              role_remote_hrefs:
                role_remote_list_action.output[:role_remote_list_response],
              git_remote_hrefs:
                git_remote_list_action.output[:git_remote_list_response]
            )
          end

          def total_count
            1
          end

          def create_sub_plans
            repository_hrefs = input[:repository_hrefs]
            distribution_hrefs = input[:distribution_hrefs]
            collection_remote_hrefs = input[:collection_remote_hrefs]
            role_remote_hrefs = input[:role_remote_hrefs]
            git_remote_hrefs = input[:git_remote_hrefs]

            trigger(
              ::ForemanAnsibleDirector::Actions::ConsistencyCheck::Destroy::Repositories,
              unreferenced_repository_hrefs: repository_hrefs.map { |x| x[:pulp_href] }
            )
            trigger(
              ::ForemanAnsibleDirector::Actions::ConsistencyCheck::Destroy::Distributions,
              unreferenced_distribution_hrefs: distribution_hrefs.map { |x| x[:pulp_href] }
            )
            trigger(
              ::ForemanAnsibleDirector::Actions::ConsistencyCheck::Destroy::CollectionRemotes,
              unreferenced_collection_remote_hrefs: collection_remote_hrefs.map { |x| x[:pulp_href] }
            )
            trigger(
              ::ForemanAnsibleDirector::Actions::ConsistencyCheck::Destroy::RoleRemotes,
              unreferenced_role_remote_hrefs: role_remote_hrefs.map { |x| x[:pulp_href] }
            )
            trigger(
              ::ForemanAnsibleDirector::Actions::ConsistencyCheck::Destroy::GitRemotes,
              unreferenced_git_remote_hrefs: git_remote_hrefs.map { |x| x[:pulp_href] }
            )
          end
        end
      end
    end
  end
end
