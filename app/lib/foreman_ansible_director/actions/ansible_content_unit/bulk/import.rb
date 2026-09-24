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

          # WithSubPlans#recalculate_counts lumps sub-plans that stopped with a :warning result
          # (e.g. a collection import that could only partially import its requested content, see
          # ImportProviders::Galaxy::VerifyCollectionImport) together with genuine :error sub-plans into
          # :failed_count, which in turn makes #check_for_errors! raise and pause this bulk task
          # even though nothing actually failed. Reclassify warning-only sub-plans as successes
          # so :failed_count reflects only genuine errors (which should still pause, as usual).
          def recalculate_counts
            super
            stopped_with_warning = sub_plans_count('state' => %w[stopped], 'result' => 'warning')
            # Reclassify warning-only sub-plans as successes (not failures) so #done? still sees
            # success_count + failed_count + cancelled_count add up to total_count; merely
            # subtracting them from failed_count would leave them uncounted and the bulk task
            # would never finish.
            output[:failed_count] -= stopped_with_warning
            output[:success_count] += stopped_with_warning
            output[:warning_count] = stopped_with_warning
          end
        end
      end
    end
  end
end
