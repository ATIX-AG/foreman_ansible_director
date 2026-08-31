# frozen_string_literal: true

module ForemanAnsibleDirector
  module AnsibleVariableValue
    module Query
      class Local
        extend ::ForemanAnsibleDirector::Abstract::Variables::ValueQuery

        class << self
          def raw_value(instance:)
            instance[:raw_value]
          end
        end
      end
    end
  end
end
