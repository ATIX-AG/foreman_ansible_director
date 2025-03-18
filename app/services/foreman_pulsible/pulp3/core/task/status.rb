# frozen_string_literal: true

module ForemanPulsible
  module Pulp3
    module Core
      module Task
        class Status < TaskApi
          def initialize(task_href, options = {})
            super options
            @task_href = task_href
          end

          def request
            @task_api_client.read(@task_href, @options)
          end
        end
      end
    end
  end
end
