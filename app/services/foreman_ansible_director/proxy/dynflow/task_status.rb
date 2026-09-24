# frozen_string_literal: true

module ForemanAnsibleDirector
  module Proxy
    module Dynflow
      class TaskStatus
        def initialize(proxy_id, proxy_task_id)
          proxy_resource = BaseClient.proxy_resource(proxy_id)
          @resource = proxy_resource["/dynflow/tasks/#{proxy_task_id}/status"]
        end

        def request
          @resource.get
        end
      end
    end
  end
end
