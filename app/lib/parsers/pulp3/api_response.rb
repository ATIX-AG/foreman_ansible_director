module Parsers
  module Pulp3
    class ApiResponse
      def initialize(api_response)
        @raw_response = api_response.as_json
      end
    end
  end
end