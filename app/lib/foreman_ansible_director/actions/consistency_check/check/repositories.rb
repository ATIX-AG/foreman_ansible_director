# frozen_string_literal: true

module ForemanAnsibleDirector
  module Actions
    module ConsistencyCheck
      module Check
        class Repositories < ::ForemanAnsibleDirector::Actions::Base::AnsibleDirectorAction
          input_format do
          end

          output_format do
            param :unreferenced_repository_hrefs, Array
          end

          def plan(*_args)
            # It remains to be seen how many ContentUnits users imports.
            # This is fine for X000, but for any more than that, batching is needed.
            all_referenced_repository_hrefs = Set.new
            all_referenced_repository_hrefs.merge(
              ::ForemanAnsibleDirector::ContentUnitVersion.unscoped.all.pluck(:pulp_repository_href)
            )
            all_referenced_repository_hrefs.merge(
              ::ForemanAnsibleDirector::ContentUnitRevision.unscoped.all.pluck(:pulp_repository_href)
            )

            repository_list_action = plan_action(::ForemanAnsibleDirector::Actions::Pulp3::Ansible::Repository::ListAll)
            plan_self(
              all_referenced_repository_hrefs: all_referenced_repository_hrefs.to_a,
              repository_list_action: repository_list_action.output
            )
          end

          def run
            all_referenced_repository_hrefs = Set.new(input[:all_referenced_repository_hrefs])
            all_pulp_repository_hrefs = input[:repository_list_action][:repository_list_response]

            unreferenced_repository_hrefs = []

            all_pulp_repository_hrefs.each do |repository|
              pulp_href = repository[:pulp_href]
              unreferenced_repository_hrefs << pulp_href unless all_referenced_repository_hrefs.include?(pulp_href)
            end

            output.update(unreferenced_repository_hrefs: unreferenced_repository_hrefs)
          end
        end
      end
    end
  end
end
