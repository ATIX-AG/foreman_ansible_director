module ForemanPulsible
  module Pulp3
    module Core
      module Task
        class TaskApi < CoreApi
          def initialize(options = {})
            super options
            @task_api_client = PulpcoreClient::TasksApi.new(@core_api_client)
          end
        end
      end
    end
  end
end