# frozen_string_literal: true

module ForemanAnsibleDirector
  module Issues
    module Warnings
      class BaseWarning < BaseIssue
        def render_for_response
          {
            type: 'warning',
            title: title,
            message: message,
          }
        end
      end
    end
  end
end
