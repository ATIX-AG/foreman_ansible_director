# frozen_string_literal: true

require 'foreman_ansible_director_test_helper'
require 'dynflow/testing'

module ForemanAnsibleDirectorTests
  module Actions
    module Unit
      class BulkImportTest < ForemanAnsibleDirectorTestCase
        ACTION_CLASS = ::ForemanAnsibleDirector::Actions::AnsibleContentUnit::Bulk::Import

        # Builds a Run-phase action with a given :resolved_content_units count (used for
        # #total_count) and an output hash seeded as #recalculate_counts expects it, without
        # requiring a real Dynflow::World/persistence layer - #sub_plans_count is stubbed below.
        def build_action(unit_count:)
          execution_plan = Dynflow::Testing::DummyExecutionPlan.new
          step = Dynflow::Testing::DummyStep.new
          ACTION_CLASS.new(
            { step: step,
              execution_plan_id: execution_plan.id,
              id: Dynflow::Testing.get_id,
              phase: Dynflow::Action::Run,
              plan_step_id: step.id,
              run_step_id: step.id,
              finalize_step_id: nil,
              input: { resolved_content_units: Array.new(unit_count) },
              output: {} },
            execution_plan.world
          )
        end

        def stub_sub_plan_counts(action, failed_or_warning:, success:, warning_only:)
          action.stubs(:sub_plans_count)
                .with('state' => %w[paused stopped], 'result' => %w[error warning])
                .returns(failed_or_warning)
          action.stubs(:sub_plans_count)
                .with('state' => 'stopped', 'result' => 'success')
                .returns(success)
          action.stubs(:sub_plans_count)
                .with('state' => %w[stopped], 'result' => 'warning')
                .returns(warning_only)
        end

        test 'reclassifies warning-only sub-plans as successes so the task does not pause or hang' do
          action = build_action(unit_count: 2)
          stub_sub_plan_counts(action, failed_or_warning: 2, success: 0, warning_only: 2)

          action.recalculate_counts

          assert_equal 0, action.output[:failed_count]
          assert_equal 2, action.output[:success_count]
          assert_equal 2, action.output[:warning_count]
          # #done?'s arithmetic must still balance, or the task would hang in :running forever.
          assert_equal 0, action.total_count - action.output[:success_count] -
            action.output[:failed_count] - action.output[:cancelled_count]
          # #check_for_errors! must not raise: there was no genuine failure, only warnings.
          assert_nothing_raised { action.check_for_errors! }
        end

        test 'still treats genuine errors as failures even when some sub-plans only warned' do
          action = build_action(unit_count: 3)
          stub_sub_plan_counts(action, failed_or_warning: 2, success: 1, warning_only: 1)

          action.recalculate_counts

          assert_equal 1, action.output[:failed_count]
          assert_equal 2, action.output[:success_count]
          assert_equal 1, action.output[:warning_count]
          assert_equal 0, action.total_count - action.output[:success_count] -
            action.output[:failed_count] - action.output[:cancelled_count]
          # A genuine failure remains, so the task should still raise (and pause, as usual).
          assert_raises(::Dynflow::Action::V2::WithSubPlans::SubtaskFailedException) { action.check_for_errors! }
        end

        test 'leaves failed_count untouched when there are no warnings at all' do
          action = build_action(unit_count: 2)
          stub_sub_plan_counts(action, failed_or_warning: 1, success: 1, warning_only: 0)

          action.recalculate_counts

          assert_equal 1, action.output[:failed_count]
          assert_equal 1, action.output[:success_count]
          assert_equal 0, action.output[:warning_count]
          assert_raises(::Dynflow::Action::V2::WithSubPlans::SubtaskFailedException) { action.check_for_errors! }
        end
      end
    end
  end
end
