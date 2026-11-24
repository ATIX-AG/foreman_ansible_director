# frozen_string_literal: true

module ForemanAnsibleDirector
  module Actions
    module ExecutionEnvironment
      class Import < ::ForemanAnsibleDirector::Actions::Base::AnsibleDirectorAction
        execution_plan_hooks.use :update_failed, on: :paused
        execution_plan_hooks.use :update_success, on: :success

        input_format do
          param :execution_environment_id
          param :katello_repository_options, Hash, required: true
        end

        def plan(args)
          execution_environment_id = args[:execution_environment_id]
          katello_repository_options = args[:katello_repository_options]

          sequence do
            katello_action_wrapper = plan_action(
              ::ForemanAnsibleDirector::Actions::ExecutionEnvironment::ImportExecutionEnvironment,
              execution_environment_id: execution_environment_id,
              katello_repository_options: katello_repository_options
            )

            plan_self(
              execution_environment_id: execution_environment_id,
              katello_action_wrapper: katello_action_wrapper.output,
              katello_repository_options: katello_repository_options
            )
          end
        end

        def finalize
          katello_repository_options = input[:katello_repository_options]
          katello_action_wrapper_output = input[:katello_action_wrapper]
          ee_id = input[:execution_environment_id]
          env = ::ForemanAnsibleDirector::ExecutionEnvironment.find_by!(id: ee_id)
          root_repository = ::Katello::RootRepository.find_by!(name: katello_repository_options[:name])

          unless katello_action_wrapper_output[:success_count] == katello_action_wrapper_output[:total_count]
            raise "Foreman failed to download the container image from #{env.container_image_url}.
                    Check the subtask's logs for more details."
          end

          container_repository = root_repository.repositories.first
          unless container_repository
            raise "Unexpected repository count. Please delete #{root_repository.name} and try again."
          end

          planned_tags_count = container_repository
                               .docker_tags
                               .where(name: katello_repository_options[:include_tags])
                               .size
          unless planned_tags_count == 1
            raise "Foreman did not find the container image \"#{env.container_image_url}\".
                      Ensure the repository and tag are correct."
          end
          nil
        end

        def update_success(execution_plan)
          ee_id = execution_plan.entry_action.input[:execution_environment_id]
          ee = ::ForemanAnsibleDirector::ExecutionEnvironment.find_by!(id: ee_id)
          ee.update!(
            status: 'success'
          )
        end

        def update_failed(execution_plan)
          ee_id = execution_plan.entry_action.input[:execution_environment_id]
          ee = ::ForemanAnsibleDirector::ExecutionEnvironment.find_by!(id: ee_id)
          ee.update!(
            status: 'failed'
          )
        end

        def rescue_strategy_for_self
          Dynflow::Action::Rescue::Fail
        end
      end
    end
  end
end
