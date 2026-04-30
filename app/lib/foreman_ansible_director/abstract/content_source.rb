# frozen_string_literal: true

module ForemanAnsibleDirector
  module Abstract
    module ContentSource
      def cs_content_unit_versions
        raise NotImplementedError
      end

      def cs_name
        raise NotImplementedError
      end

      def cs_execution_environment
        raise NotImplementedError
      end
    end
  end
end
