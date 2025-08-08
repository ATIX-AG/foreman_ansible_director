# frozen_string_literal: true

module Parsers
  module Proxy
    module Dynflow
      class DynflowResponse
        attr_reader :raw_response

        def initialize(api_response)
          @raw_response = api_response
          @parsed_response = JSON.parse(api_response.body)
        end
      end
    end
  end
end
