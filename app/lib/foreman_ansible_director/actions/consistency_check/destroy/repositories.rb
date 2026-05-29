# frozen_string_literal: true

module ForemanAnsibleDirector
  module Actions
    module ConsistencyCheck
      module Destroy
        class Repositories < ::ForemanAnsibleDirector::Actions::Base::AnsibleDirectorAction
          input_format do
            param :unreferenced_repository_hrefs, Array
          end

          output_format do
          end

          def plan(args)
            unreferenced_repository_hrefs = args[:unreferenced_repository_hrefs]

            unreferenced_repository_hrefs.each do |repo_href|
              plan_action(
                ::ForemanAnsibleDirector::Actions::Pulp3::Ansible::Repository::Destroy,
                repository_href: repo_href
              )
            end
          end
        end
      end
    end
  end
end
