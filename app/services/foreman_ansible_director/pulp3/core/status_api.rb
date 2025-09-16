# frozen_string_literal: true

module ForemanAnsibleDirector
  module Pulp3
    module Core
      class StatusApi < CoreApi
        def initialize
          super
          @request_client = PulpcoreClient::StatusApi.new(@core_api_client)
        end

        def request
          @request_client.status_read(@options)
        end
      end
    end
  end
end
