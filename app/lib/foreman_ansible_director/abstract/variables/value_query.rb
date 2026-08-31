# frozen_string_literal: true

module ForemanAnsibleDirector
  module Abstract
    module Variables
      module ValueQuery
        def raw_value(instance:)
          raise NotImplementedError
        end
      end
    end
  end
end
