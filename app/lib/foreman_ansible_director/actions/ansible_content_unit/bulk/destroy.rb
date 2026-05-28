# frozen_string_literal: true

module ForemanAnsibleDirector
  module Actions
    module AnsibleContentUnit
      module Bulk
        class Destroy < ::ForemanAnsibleDirector::Actions::Base::AnsibleDirectorAction
          include Dynflow::Action::V2::WithSubPlans

          input_format do
            param :resolved_content_units, type: Hash
            param :organization_id, type: Integer
          end

          def create_sub_plans
            input[:resolved_content_units].each do |unit_id, instruction|
              complete = instruction.delete(:complete)
              trigger(::ForemanAnsibleDirector::Actions::AnsibleContentUnit::Destroy,
                unit_id: unit_id,
                unit_version_ids: instruction[:versions],
                complete: complete)
            end
          end

          def total_count
            input[:resolved_content_units].keys.length
          end
        end
      end
    end
  end
end
