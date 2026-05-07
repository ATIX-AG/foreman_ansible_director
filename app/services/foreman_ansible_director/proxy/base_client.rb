# frozen_string_literal: true

module ForemanAnsibleDirector
  module Proxy
    class BaseClient < ::ProxyAPI::Resource
      def initialize(proxy)
        @url = proxy.url
        super(url: @url)
      end

      def launch_dynflow_task(proxy_task_id, operation, action_class, action_input)
        payload = {
          operation: operation,
          input: {
            proxy_task_id => {
              action_class: action_class,
              action_input: action_input,
            },
          },
        }.to_json
        post(payload, 'dynflow/tasks/launch')
      end

      def dynflow_task_status(proxy_task_id)
        get("dynflow/tasks/#{proxy_task_id}/status")
      end
    end
  end
end
