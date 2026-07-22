# frozen_string_literal: true

module ForemanAnsibleDirector
  module Issues
    module Errors
      class InternalError < BaseError
        def initialize(exception:,
                       coincidence_id:)
          @exception = exception
          @coincidence_id = coincidence_id
          super
        end

        def title
          if Rails.env.development?
            _('Internal server error')
          else
            "Internal Error: #{@exception.class}"
          end
        end

        def message
          if Rails.env.development?
            <<~MESSAGE
              Something went wrong trying to process the request.
              You can check the logs using the following command:
              foreman-rake errors:fetch_log request_id=#{@coincidence_id[0, 8]}
            MESSAGE
          else
            @exception.message
          end
        end
      end
    end
  end
end
