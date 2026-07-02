# frozen_string_literal: true

module ForemanAnsibleDirector
  module Issues
    module Errors
      class BaseError < BaseIssue
        def render_for_response
          {
            type: 'error',
            title: title,
            message: message,
          }
        end
      end
    end
  end
end
