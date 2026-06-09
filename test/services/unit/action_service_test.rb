require 'foreman_ansible_director_test_helper'

module ForemanAnsibleDirectorTests
  module Services
    module Unit
      class ActionServiceTest < ForemanAnsibleDirectorTestCase

        describe '#trigger' do

          fake_action_class = Object.new
          fake_action_class.define_singleton_method(:name) { "TestAction" }

          before do
            ::ForemanAnsibleDirector::Logging::ActionLogger.stub(:log_trigger, ->(*) {}) do
            end
          end

          test 'raises ArgumentError for invalid sync_mode' do
            assert_raises(ArgumentError) do
              ::ForemanAnsibleDirector::ActionService.trigger(
                fake_action_class,
                task_args: { foo: 'bar' },
                mode: :invalid_mode
              )
            end
          end

          test 'uses :sync when mode is :sync' do
            task_called = false
            ForemanTasks.stub(:sync_task, ->(action, *args) {
              task_called = true
            }) do
              ::ForemanAnsibleDirector::ActionService.trigger(
                fake_action_class,
                mode: :sync
              )
            end

            assert task_called
          end

          test 'uses :async when mode is :async' do
            task_called = false
            ForemanTasks.stub(:async_task, ->(action, *args) {
              task_called = true
            }) do
              ::ForemanAnsibleDirector::ActionService.trigger(
                fake_action_class,
                mode: :async
              )
            end

            assert task_called
          end

          test 'resolves mode :auto to :sync in non-production environments' do
            Rails.env.stub(:production?, false) do
              task_called = false

              ForemanTasks.stub(:sync_task, ->(action, *args) {
                task_called = true
              }) do
                ::ForemanAnsibleDirector::ActionService.trigger(
                  fake_action_class,
                )
              end

              assert task_called
            end
          end

          test 'resolves mode :auto to :async in production environment' do
            Rails.env.stub(:production?, true) do
              task_called = false

              ForemanTasks.stub(:async_task, ->(action, *args) {
                task_called = true
              }) do
                ::ForemanAnsibleDirector::ActionService.trigger(
                  fake_action_class,
                )
              end

              assert task_called
            end
          end

          test 'passes action_class correctly to task' do

            received_action = nil

            ForemanTasks.stub(:sync_task, ->(action, *args) {
              received_action = action
            }) do
              ::ForemanAnsibleDirector::ActionService.trigger(
                fake_action_class,
                task_args: {},
                mode: :sync
              )
            end

            assert_equal fake_action_class, received_action
          end

          test 'correctly passes all task_args' do

            integer_arg = 1
            boolean_arg = true
            array_arg = [1, 2, 3]
            hash_arg = { a: 1, b: 2 }

            task_args = {
              integer_arg: integer_arg,
              boolean_arg: boolean_arg,
              array_arg: array_arg,
              hash_arg: hash_arg,
            }.freeze

            passed_args = {}
            ForemanTasks.stub(:sync_task, ->(action, *args) {
              passed_args = args.dup
            }) do
              ::ForemanAnsibleDirector::ActionService.trigger(
                fake_action_class,
                task_args: task_args,
                mode: :sync
              )
            end


            assert_equal passed_args.class, Array
            # Single splat operator converts the double-splatted keyword arguments into an array
            args = passed_args[0]
            assert_equal task_args[:integer_arg], args[:integer_arg]
            assert_equal task_args[:boolean_arg], args[:boolean_arg]
            assert_equal task_args[:array_arg], args[:array_arg]
            assert_equal task_args[:hash_arg], args[:hash_arg]
          end

          test 'calls the action logger with correct arguments' do

            logged_action_class = nil
            logged_task_args = nil
            logged_mode = nil

            ::ForemanAnsibleDirector::Logging::ActionLogger.stub(:log_trigger, ->(action_class:,
                                                                                       task_args:,
                                                                                       mode:) {
              logged_action_class = action_class
              logged_task_args = task_args
              logged_mode = mode
            }) do
              ForemanTasks.stub(:async_task, ->(action, *args) {
              }) do
                ::ForemanAnsibleDirector::ActionService.trigger(
                  fake_action_class,
                  task_args: { foo: :bar },
                  mode: :async
                )
              end
            end

            assert_equal fake_action_class, logged_action_class
            assert_equal({ foo: :bar }, logged_task_args)
            assert_equal :async, logged_mode
          end

        end

      end
    end
  end
end
