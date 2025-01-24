module ForemanPulsible
  module Pulp3
    module Core
      class CoreApi
        def initialize(options = {})
          @options = options
          @core_api_client = Pulp3::BaseClient.core_api_client
        end

        def request
          fail NotImplementedError
        end
      end
    end
  end
end