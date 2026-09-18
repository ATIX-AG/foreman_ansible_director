# frozen_string_literal: true

module ForemanAnsibleDirector
  module Abstract
    module Variables
      module ValueTransformer
        def transform(raw_value:)
          raise NotImplementedError
        end
      end
    end
  end
end
