# frozen_string_literal: true

module ForemanAnsibleDirector
  module Actions
    module AnsibleContentUnit
      module Bulk
        class Destroy < ::ForemanAnsibleDirector::Actions::Base::AnsibleDirectorAction
          input_format do
            param :resolved_content_units, type: Array
            param :organization_id, type: Integer
          end

          def plan(args)
            concurrence do
              args[:resolved_content_units].each do |unit_hash|
                plan_action(::ForemanAnsibleDirector::Actions::AnsibleContentUnit::Destroy,
                  unit: unit_hash[:unit],
                  content_unit_id: unit_hash[:content_unit_id],
                  organization_id: args[:organization_id])
              end
            end
          end
        end
      end
    end
  end
end
