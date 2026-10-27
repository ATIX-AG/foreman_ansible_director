# frozen_string_literal: true

module ForemanAnsibleDirector
  module Issues
    module Errors
      class ModelValidationError < BaseError
        def initialize(exception:)
          @exception = exception
          super
        end

        def status_code
          422
        end

        def title
          _('Invalid record')
        end

        def message
          <<~MESSAGE
            A record of the model #{@exception.record.class} could not be saved.
            The following validation errors were encountered:

            #{@exception.record.errors.full_messages.map do |error_message|
              <<~ERROR
                - #{error_message}
              ERROR
            end.join("\n")
            }
          MESSAGE
        end
      end
    end
  end
end
