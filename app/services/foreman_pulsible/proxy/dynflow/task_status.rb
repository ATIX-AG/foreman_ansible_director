# frozen_string_literal: true

module ForemanPulsible
  module Proxy
    module Dynflow
      class TaskStatus
        def initialize(proxy_task_id)
          proxy_resource = BaseClient.proxy_resource
          @resource = proxy_resource["/dynflow/tasks/#{proxy_task_id}/status"]
        end

        def request
          @resource.get
        end
      end
    end
  end
end
