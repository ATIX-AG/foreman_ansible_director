# frozen_string_literal: true

module ForemanAnsibleDirector
  module Issues
    module Warnings
      class InvalidCollectionRoleReference < BaseWarning
        def initialize(collection_namespace:,
                       collection_name:,
                       collection_role_name:,
                       content_source:,
                       crn:)
          @collection_namespace = collection_namespace
          @collection_name = collection_name
          @collection_role_name = collection_role_name
          @content_source = content_source
          @crn = crn
          super
        end

        def title
          fqrn = "#{@collection_namespace}.#{@collection_name}.#{@collection_role_name}"
          "Ansible collection role \"#{fqrn}\" not consumed by #{@crn.cr_name}"
        end

        def message
          <<~MESSAGE
            The #{@crn.class.name} with ID #{@crn.id} does not have the following Ansible collection role assigned to it:
            Collection namespace: #{@collection_namespace}
            Collection name: #{@collection_name}
            Collection role name: #{@collection_role_name}
            Ensure the lifecycle environment #{@content_source.cs_name} supplies this collection role.
          MESSAGE
        end
      end
    end
  end
end
