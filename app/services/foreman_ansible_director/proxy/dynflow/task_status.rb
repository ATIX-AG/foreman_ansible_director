# frozen_string_literal: true

module ForemanAnsibleDirector
  module Proxy
    module Dynflow
      class TaskStatus
        def initialize(proxy_task_id, smart_proxy_id)
          @client = BaseClient.new(::SmartProxy.find(smart_proxy_id))
          @proxy_task_id = proxy_task_id
        end

        def request
          @client.dynflow_task_status(@proxy_task_id)
        end
      end
    end
  end
end
