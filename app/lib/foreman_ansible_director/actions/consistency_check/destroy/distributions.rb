# frozen_string_literal: true

module ForemanAnsibleDirector
  module Actions
    module ConsistencyCheck
      module Destroy
        class Distributions < ::ForemanAnsibleDirector::Actions::Base::AnsibleDirectorAction
          input_format do
            param :unreferenced_distribution_hrefs, Array
          end

          output_format do
          end

          def plan(args)
            unreferenced_distribution_hrefs = args[:unreferenced_distribution_hrefs]

            unreferenced_distribution_hrefs.each do |distribution_href|
              plan_action(
                ::ForemanAnsibleDirector::Actions::Pulp3::Ansible::Distribution::Destroy,
                distribution_href: distribution_href
              )
            end
          end
        end
      end
    end
  end
end
