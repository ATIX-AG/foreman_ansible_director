# frozen_string_literal: true

module ForemanAnsibleDirector
  module Actions
    module ConsistencyCheck
      module Check
        class Distributions < ::ForemanAnsibleDirector::Actions::Base::AnsibleDirectorAction
          input_format do
          end

          output_format do
            param :unreferenced_distribution_hrefs, Array
          end

          def plan(*_args)
            all_referenced_distribution_hrefs = Set.new
            all_referenced_distribution_hrefs.merge(
              ::ForemanAnsibleDirector::ContentUnitVersion.unscoped.all.pluck(:pulp_distribution_href)
            )
            all_referenced_distribution_hrefs.merge(
              ::ForemanAnsibleDirector::ContentUnitRevision.unscoped.all.pluck(:pulp_distribution_href)
            )

            distribution_list_action = plan_action(
              ::ForemanAnsibleDirector::Actions::Pulp3::Ansible::Distribution::ListAll
            )
            plan_self(
              all_referenced_distribution_hrefs: all_referenced_distribution_hrefs.to_a,
              distribution_list_action: distribution_list_action.output
            )
          end

          def run
            all_referenced_distribution_hrefs = Set.new(input[:all_referenced_distribution_hrefs])
            all_pulp_distribution_hrefs = input[:distribution_list_action][:distribution_list_response]

            unreferenced_distribution_hrefs = []

            all_pulp_distribution_hrefs.each do |distribution|
              pulp_href = distribution[:pulp_href]
              unreferenced_distribution_hrefs << pulp_href unless all_referenced_distribution_hrefs.include?(pulp_href)
            end

            output.update(unreferenced_distribution_hrefs: unreferenced_distribution_hrefs)
          end
        end
      end
    end
  end
end
