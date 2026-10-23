# frozen_string_literal: true

require 'foreman_ansible_director_test_helper'
require 'dynflow/testing'

module ForemanAnsibleDirectorTests
  module Actions
    module Unit
      class CollectionRemoteUpdateTest < ForemanAnsibleDirectorTestCase
        ACTION_CLASS = ::ForemanAnsibleDirector::Actions::Pulp3::Ansible::Remote::Collection::Update
        TASK_STATUS = ::ForemanAnsibleDirector::Pulp3::Core::Task::Status

        # Builds a Run-phase action instance directly (bypassing .plan/.execute), so the
        # polling helper methods can be exercised in isolation with a controlled output hash.
        def build_action(output: {})
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
              input: {
                collection_remote_href: '/pulp/api/v3/remotes/ansible/collection/1/',
                requirements: 'collections: []',
              },
              output: output },
            execution_plan.world
          )
        end

        test 'poll_external_task reports full progress without polling Pulp when the PATCH was a no-op' do
          TASK_STATUS.expects(:new).never

          action = build_action(output: { collection_remote_update_response: { task: nil } })

          assert_equal({ progress: ACTION_CLASS::FULL_PROGRESS }, action.poll_external_task)
        end

        test 'poll_external_task polls the Pulp task when the PATCH spawned one' do
          TASK_STATUS.stubs(:new).with('/pulp/api/v3/tasks/abc/').returns(
            stub(request: { 'state' => 'running' })
          )

          action = build_action(
            output: { collection_remote_update_response: { task: '/pulp/api/v3/tasks/abc/' } }
          )

          assert_equal({ progress: 0 }, action.poll_external_task)
        end

        test 'done? is true once the task reaches full progress' do
          action = build_action(output: { task: { progress: ACTION_CLASS::FULL_PROGRESS } })

          assert action.done?
        end

        test 'done? is false while the task is still in progress' do
          action = build_action(output: { task: { progress: 0 } })

          refute action.done?
        end
      end
    end
  end
end
