# frozen_string_literal: true

module ForemanAnsibleDirector
  module Issues
    module Errors
      class RecordNotFound < BaseError
        def initialize(exception:)
          @exception = exception
          super
        end

        def status_code
          404
        end

        def title
          "#{@exception.model} not found by id #{@exception.id}"
        end

        def message
          <<~MESSAGE
            A record of the model #{@exception.model} with the id #{@exception.id} could not be found.
            Verify it exists and you have the permissions required to access it.
          MESSAGE
        end
      end
    end
  end
end
