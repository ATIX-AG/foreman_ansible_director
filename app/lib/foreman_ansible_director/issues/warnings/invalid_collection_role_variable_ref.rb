# frozen_string_literal: true

module ForemanAnsibleDirector
  module Issues
    module Warnings
      class InvalidCollectionRoleVariableRef < BaseWarning
        def initialize(
          variable_name:,
          collection_version:,
          collection_namespace:,
          collection_name:,
          collection_role_name:,
          crn:
        )
          @variable_name = variable_name
          @collection_version = collection_version
          @collection_namespace = collection_namespace
          @collection_name = collection_name
          @collection_role_name = collection_role_name
          @crn = crn
          super
        end

        def title
          fqrn = "#{@collection_namespace}.#{@collection_name}.#{@collection_role_name}"
          <<-TITLE
            Ansible variable \"#{@variable_name}\" undefined for version
            #{@collection_version.version} of collection role \"#{fqrn}\"
          TITLE
        end

        def message
          fqrn = "#{@collection_namespace}.#{@collection_name}.#{@collection_role_name}"
          <<~MESSAGE
            The version of "#{fqrn}" consumed by #{@crn.name} was resolved to version #{@collection_version.version}.
            This version of the role does not define a variable with the name "#{@variable_name}".
          MESSAGE
        end
      end
    end
  end
end
