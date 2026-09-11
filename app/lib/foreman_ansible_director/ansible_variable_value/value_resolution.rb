# frozen_string_literal: true

module ForemanAnsibleDirector
  module AnsibleVariableValue
    module ValueResolution
      def value
        raw_value = query.raw_value(instance: self)
        transformer.transform(raw_value: raw_value)
      end

      private

      def query
        case self[:query]
        when 'local' then Query::Local
        end
      end

      def transformer
        case self[:transformer]
        when 'static' then Transformer::Static
        end
      end
    end
  end
end
