# frozen_string_literal: true

module ForemanAnsibleDirector
  module Proxy
    module Dynflow
      class SingleBatchAction
        def initialize(proxy_task_id, operation, action_class, action_input)
          proxy_resource = BaseClient.proxy_resource
          @resource = proxy_resource['/dynflow/tasks/launch']
          @proxy_task_id = proxy_task_id
          @operation = operation
          @action_class = action_class
          @action_input = action_input
        end

        def request
          @resource.post({
            operation: @operation,
            input: {
              @proxy_task_id => {
                action_class: @action_class,
                action_input: @action_input,
              },
            },
          }.to_json)
        end
      end
    end
  end
end
