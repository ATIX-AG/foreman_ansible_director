# frozen_string_literal: true

module ForemanAnsibleDirector
  module Abstract
    module ContentResolutionNode
      def cr_immediate_predecessor
        raise NotImplementedError
      end

      def cr_content_assignments
        raise NotImplementedError
      end

      def cr_name
        raise NotImplementedError
      end

      def cr_content_source
        raise NotImplementedError
      end

      def cr_content_source_state
        raise NotImplementedError
      end
    end
  end
end
