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
              args[:resolved_content_units].each do |unit_id, instruction|
                complete = instruction.delete(:complete)
                plan_action(::ForemanAnsibleDirector::Actions::AnsibleContentUnit::Destroy,
                  unit_id: unit_id,
                  unit_version_ids: instruction[:versions],
                  complete: complete)
              end
            end
          end
        end
      end
    end
  end
end
