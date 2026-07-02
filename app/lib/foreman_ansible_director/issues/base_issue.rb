# frozen_string_literal: true

module ForemanAnsibleDirector
  module Issues
    class BaseIssue
      def initialize(**kwargs)
      end

      def title
        raise NotImplementedError
      end

      def message
        raise NotImplementedError
      end

      def render_for_logs
        render_for_response
      end
    end
  end
end
