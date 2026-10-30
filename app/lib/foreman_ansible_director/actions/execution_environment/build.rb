# frozen_string_literal: true

module ForemanAnsibleDirector
  module Actions
    module ExecutionEnvironment
      class Build < ::ForemanAnsibleDirector::Actions::Base::AnsibleDirectorAction
        middleware.do_not_use ::Dynflow::Middleware::Common::Transaction

        input_format do
          param :proxy_id, Integer
          param :proxy_task_id, String
          param :execution_environment_definition, Hash
          param :execution_environment_id, String
          param :push_url, String
        end

        def plan(args)
          proxy_action_wrapper = plan_action(
            ::ForemanAnsibleDirector::Actions::Proxy::BuildExecutionEnvironment,
            **args
          )
          plan_self(
            proxy_action_success: proxy_action_wrapper.output[:task][:success],
            proxy_action_log: proxy_action_wrapper.output[:task][:external_output],
            execution_environment_id: args[:execution_environment_id]
          )
        end

        def finalize
          execution_environment_id = input[:execution_environment_id]
          proxy_action_success = input[:proxy_action_success]

          env = ::ForemanAnsibleDirector::ExecutionEnvironment.find_by(id: execution_environment_id)

          unless proxy_action_success
            env.update!(
              status: 'failed'
            )
            raise 'The remote action failed. Review the build log for details.'
          end

          env.update!(
            status: 'success'
          )
        end

        def rescue_strategy_for_self
          Dynflow::Action::Rescue::Fail
        end
      end
    end
  end
end
