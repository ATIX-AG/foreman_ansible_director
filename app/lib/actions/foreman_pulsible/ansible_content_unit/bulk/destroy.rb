# frozen_string_literal: true

module Actions
  module ForemanPulsible
    module AnsibleContentUnit
      module Bulk
        class Destroy < ::Actions::ForemanPulsible::Base::PulsibleAction
          input_format do
            param :resolved_content_units, type: Array
            param :organization_id, type: Integer
          end

          def plan(args)
            concurrence do
              args[:resolved_content_units].each do |unit|
                plan_action(::Actions::ForemanPulsible::AnsibleContentUnit::Destroy,
                  unit: unit, organization_id: args[:organization_id])
              end
            end
          end
        end
      end
    end
  end
end
