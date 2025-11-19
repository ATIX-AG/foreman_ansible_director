# frozen_string_literal: true

module ForemanAnsibleDirector
  module Actions
    module Proxy
      class RunPlaybook < ::ForemanAnsibleDirector::Actions::Base::AnsibleDirectorAction
        include Dynflow::Action::Polling

        input_format do
          param :proxy_task_id, Integer
          param :inventory, Hash
          param :playbook, Hash
          param :content, Array
          param :execution_environment, String
        end

        output_format do
        end

        def invoke_external_task
          ::ForemanAnsibleDirector::Proxy::Dynflow::SingleBatchAction.new(
            input[:proxy_task_id], 'ansible-navigator', 'Proxy::AnsibleDirector::Actions::Meta::RunPlaybook',
            inventory: input[:inventory],
            playbook: input[:playbook],
            content: input[:content],
            execution_environment: input[:execution_environment]
          ).request
          nil
        end

        def poll_external_task
          task = ::ForemanAnsibleDirector::Proxy::Dynflow::TaskStatus.new(input[:proxy_task_id]).request
          task_status = ::ForemanAnsibleDirector::Parsers::Proxy::Dynflow::TaskStatusParser.new(task)

          { progress: task_status.progress }
        end

        def done?
          output[:task]&.[](:progress) == 1
        end

        def poll_intervals
          [2, 4, 8, 16, 32, 64]
        end

        def attempts_before_next_interval
          4
        end
      end
    end
  end
end
