# frozen_string_literal: true

module ForemanAnsibleDirector
  module Issues
    module Warnings
      class NoResolutionCandidateForRole < BaseWarning
        def initialize(role_namespace:,
                       role_name:,
                       content_source:,
                       assignment_id:)
          @role_namespace = role_namespace
          @role_name = role_name
          @content_source = content_source
          @assignment_id = assignment_id
          super
        end

        def title
          fqrn = "#{@role_namespace}.#{@role_name}"
          "No resolution candidate for Ansible role: \"#{fqrn}\""
        end

        def message
          <<~MESSAGE
            No resolution candidate was found for the following Ansible role:
            Role namespace: #{@role_namespace}
            Role name: #{@role_name}
            Ensure the lifecycle environment #{@content_source.cs_name} supplies this role,
            otherwise it will be skipped.
          MESSAGE
        end

        def render_for_response
          super.merge({ assignment_id: @assignment_id })
        end
      end
    end
  end
end
