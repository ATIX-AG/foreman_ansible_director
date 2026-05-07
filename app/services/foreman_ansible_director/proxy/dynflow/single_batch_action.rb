# frozen_string_literal: true

module ForemanAnsibleDirector
  module Proxy
    module Dynflow
      class SingleBatchAction
        def initialize(proxy_task_id, operation, action_class, smart_proxy_id, action_input)
          @client = BaseClient.new(::SmartProxy.find(smart_proxy_id))
          @proxy_task_id = proxy_task_id
          @operation = operation
          @action_class = action_class
          @action_input = action_input
        end

        def request
          @client.launch_dynflow_task(@proxy_task_id, @operation, @action_class, @action_input)
        end
      end
    end
  end
end
