# frozen_string_literal: true

module ForemanAnsibleDirector
  module Issues
    module Warnings
      class NoResolutionCandidateForCollectionRole < BaseWarning
        def initialize(collection_namespace:,
                       collection_name:,
                       collection_role_identifier:,
                       content_source:,
                       assignment_id:)
          @collection_namespace = collection_namespace
          @collection_name = collection_name
          @collection_role_identifier = collection_role_identifier
          @content_source = content_source
          @assignment_id = assignment_id
          super
        end

        def title
          fqrn = "#{@collection_namespace}.#{@collection_name}.#{@collection_role_identifier}"
          "No resolution candidate for Ansible role: \"#{fqrn}\""
        end

        def message
          <<~MESSAGE
            No resolution candidate was found for the following Ansible role:
            Collection namespace: #{@collection_namespace}
            Collection name: #{@collection_name}
            Role identifier: #{@collection_role_identifier}
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
