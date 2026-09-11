# frozen_string_literal: true

module ForemanAnsibleDirector
  module Issues
    module Errors
      class InvalidYamlError < BaseError
        def initialize(exception:)
          @exception = exception
          super
        end

        def title
          _('Invalid YAML')
        end

        def message
          <<~MESSAGE
            The YAML string you passed does not appear to be valid YAML.
            An issue was found at:
            ---
            #{@exception.message}
            ---
            Correct the issue and re-send the request.
          MESSAGE
        end

        def status_code
          422
        end
      end
    end
  end
end
