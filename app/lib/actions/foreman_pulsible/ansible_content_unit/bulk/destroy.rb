module Actions
  module ForemanPulsible
    module AnsibleContentUnit
      module Bulk
        class Destroy < ::Actions::ForemanPulsible::Base::PulsibleAction

          input_format do
            param :resolved_content_units, type: Array
          end

          def plan(args)

            concurrence do
              args[:resolved_content_units].each do |unit|
                plan_action(::Actions::ForemanPulsible::AnsibleContentUnit::Destroy,
                          unit: unit)
              end
            end

          end
        end
      end
    end
  end
end
