# frozen_string_literal: true

module ForemanAnsibleDirector
  module RequestCtx
    module RequestContextHelper
      def ctx
        ::ForemanAnsibleDirector::RequestCtx::RequestContext.current
      end
    end
  end
end
