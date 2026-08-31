# frozen_string_literal: true

module ForemanAnsibleDirector
  module AnsibleVariableValue
    module Transformer
      class Static
        extend ::ForemanAnsibleDirector::Abstract::Variables::ValueTransformer
        class << self
          def transform(raw_value:)
            YAML.safe_load raw_value
          end
        end
      end
    end
  end
end
