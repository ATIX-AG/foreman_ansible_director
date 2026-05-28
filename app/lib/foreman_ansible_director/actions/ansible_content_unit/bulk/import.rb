# frozen_string_literal: true

module ForemanAnsibleDirector
  module Actions
    module AnsibleContentUnit
      module Bulk
        class Import < ::ForemanAnsibleDirector::Actions::Base::AnsibleDirectorAction
          include Dynflow::Action::V2::WithSubPlans

          input_format do
            param :resolved_content_units, type: Hash
            param :organization_id, type: Integer
          end

          def create_sub_plans
            input[:resolved_content_units].each do |unit|
              trigger(::ForemanAnsibleDirector::Actions::AnsibleContentUnit::Import,
                # Downstream actions expect SimpleAnsibleContentUnit objects, but input has already been serialized
                unit: ::ForemanAnsibleDirector::AnsibleContent::SimpleAnsibleContentUnit.new(
                  unit_type: unit[:unit_type].to_sym,
                  unit_name: unit[:unit_name],
                  unit_source_type: unit[:source_type].to_sym,
                  unit_source: unit[:source],
                  unit_versions: unit[:versions]
                ),
                organization_id: input[:organization_id])
            end
          end

          def total_count
            input[:resolved_content_units].size
          end
        end
      end
    end
  end
end
