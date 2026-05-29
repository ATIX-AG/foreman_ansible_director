# frozen_string_literal: true

module ForemanAnsibleDirector
  module Actions
    module ConsistencyCheck
      module Check
        class GitRemotes < ::ForemanAnsibleDirector::Actions::Base::AnsibleDirectorAction
          input_format do
          end

          output_format do
            param :unreferenced_git_remote_hrefs, Array
          end

          def plan(*_args)
            all_referenced_git_remote_hrefs = Set.new
            all_referenced_git_remote_hrefs.merge(
              ::ForemanAnsibleDirector::ContentUnitVersion.unscoped.where(
                source_type: 'git'
              ).all.pluck(:pulp_remote_href)
            )
            all_referenced_git_remote_hrefs.merge(
              ::ForemanAnsibleDirector::ContentUnitRevision.unscoped.all.pluck(:pulp_remote_href)
            )

            git_remote_list_action = plan_action(
              ::ForemanAnsibleDirector::Actions::Pulp3::Ansible::Remote::Git::ListAll
            )
            plan_self(
              all_referenced_git_remote_hrefs: all_referenced_git_remote_hrefs.to_a,
              git_remote_list_action: git_remote_list_action.output
            )
          end

          def run
            all_referenced_git_remote_hrefs = Set.new(input[:all_referenced_git_remote_hrefs])
            all_pulp_git_remote_hrefs = input[:git_remote_list_action][:git_remote_list_response]

            unreferenced_git_remote_hrefs = []

            all_pulp_git_remote_hrefs.each do |git_remote|
              pulp_href = git_remote[:pulp_href]
              unreferenced_git_remote_hrefs << pulp_href unless all_referenced_git_remote_hrefs.include?(pulp_href)
            end

            output.update(unreferenced_git_remote_hrefs: unreferenced_git_remote_hrefs)
          end
        end
      end
    end
  end
end
