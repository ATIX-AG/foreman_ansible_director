# frozen_string_literal: true

module ForemanAnsibleDirector
  module Issues
    module Errors
      class ParameterMissingError < BaseError
        def initialize(exception:)
          @exception = exception
          super
        end

        def title
          _('Required parameter missing')
        end

        def message
          <<~MESSAGE
            The required parameter "#{@exception.param}" is missing from the request.
            Include the parameter and try re-sending the request.
            Check the API documentation for more information on "#{@exception.param}".
          MESSAGE
        end

        def status_code
          422
        end
      end
    end
  end
end
