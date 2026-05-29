# frozen_string_literal: true

module ForemanAnsibleDirector
  module Actions
    module ConsistencyCheck
      module Check
        class RoleRemotes < ::ForemanAnsibleDirector::Actions::Base::AnsibleDirectorAction
          input_format do
          end

          output_format do
            param :unreferenced_role_remote_hrefs, Array
          end

          def plan(*_args)
            all_referenced_role_remote_hrefs = Set.new
            all_referenced_role_remote_hrefs.merge(
              ::ForemanAnsibleDirector::ContentUnitVersion.unscoped.where(
                versionable_type: 'ForemanAnsibleDirector::AnsibleRole',
                source_type: 'galaxy'
              ).all.pluck(:pulp_remote_href)
            )

            role_remote_list_action = plan_action(
              ::ForemanAnsibleDirector::Actions::Pulp3::Ansible::Remote::Role::ListAll
            )
            plan_self(
              all_referenced_role_remote_hrefs: all_referenced_role_remote_hrefs.to_a,
              role_remote_list_action: role_remote_list_action.output
            )
          end

          def run
            all_referenced_role_remote_hrefs = Set.new(input[:all_referenced_role_remote_hrefs])
            all_pulp_role_remote_hrefs = input[:role_remote_list_action][:role_remote_list_response]

            unreferenced_role_remote_hrefs = []

            all_pulp_role_remote_hrefs.each do |role_remote|
              pulp_href = role_remote[:pulp_href]
              unreferenced_role_remote_hrefs << pulp_href unless all_referenced_role_remote_hrefs.include?(pulp_href)
            end

            output.update(unreferenced_role_remote_hrefs: unreferenced_role_remote_hrefs)
          end
        end
      end
    end
  end
end
