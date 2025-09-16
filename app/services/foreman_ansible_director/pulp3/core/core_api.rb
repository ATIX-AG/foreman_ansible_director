# frozen_string_literal: true

module ForemanAnsibleDirector
  module Pulp3
    module Core
      class CoreApi
        def initialize(options = {})
          @options = options
          @core_api_client = Pulp3::BaseClient.core_api_client
        end

        def request
          raise NotImplementedError
        end
      end
    end
  end
end
