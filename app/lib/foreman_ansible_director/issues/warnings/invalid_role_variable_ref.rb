# frozen_string_literal: true

module ForemanAnsibleDirector
  module Issues
    module Warnings
      class InvalidRoleVariableRef < BaseWarning
        def initialize(
          variable_name:,
          role_version:,
          role_namespace:,
          role_name:,
          crn:
        )
          @variable_name = variable_name
          @role_version = role_version
          @role_namespace = role_namespace
          @role_name = role_name
          @crn = crn
          super
        end

        def title
          fqrn = "#{@role_namespace}.#{@role_name}"
          <<-TITLE
            Ansible variable \"#{@variable_name}\" undefined for version
            #{@role_version.version} of role \"#{fqrn}\"
          TITLE
        end

        def message
          fqrn = "#{@role_namespace}.#{@role_name}"
          <<~MESSAGE
            The version of "#{fqrn}" consumed by #{@crn.name} was resolved to version #{@role_version.version}.
            This version of the role does not define a variable with the name "#{@variable_name}".
          MESSAGE
        end
      end
    end
  end
end
