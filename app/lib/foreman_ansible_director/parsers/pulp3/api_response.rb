# frozen_string_literal: true

module ForemanAnsibleDirector
  module Parsers
    module Pulp3
      class ApiResponse
        attr_reader :raw_response

        def initialize(api_response)
          @raw_response = api_response.as_json
        end
      end
    end
  end
end
