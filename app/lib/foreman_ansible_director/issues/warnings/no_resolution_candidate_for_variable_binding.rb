# frozen_string_literal: true

module ForemanAnsibleDirector
  module Issues
    module Warnings
      class NoResolutionCandidateForVariableBinding < BaseWarning
        def initialize(binding:)
          @binding = binding
          super
        end

        def title
          "No resolution candidate for variable binding: \"#{@binding[:variable_name]}\""
        end

        def message
          <<~MESSAGE
            TODO
          MESSAGE
        end

        def render_for_response
          super.merge({ binding_id: @binding[:id] })
        end
      end
    end
  end
end
