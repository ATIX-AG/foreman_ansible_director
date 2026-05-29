# frozen_string_literal: true

module ForemanAnsibleDirector
  module Actions
    module ConsistencyCheck
      module Destroy
        class RoleRemotes < ::ForemanAnsibleDirector::Actions::Base::AnsibleDirectorAction
          input_format do
            param :unreferenced_role_remote_hrefs, Array
          end

          output_format do
          end

          def plan(args)
            unreferenced_role_remote_hrefs = args[:unreferenced_role_remote_hrefs]

            unreferenced_role_remote_hrefs.each do |role_remote_href|
              plan_action(
                ::ForemanAnsibleDirector::Actions::Pulp3::Ansible::Remote::Role::Destroy,
                role_remote_href: role_remote_href
              )
            end
          end
        end
      end
    end
  end
end
