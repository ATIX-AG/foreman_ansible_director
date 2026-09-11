# frozen_string_literal: true

module ForemanAnsibleDirector
  module Issues
    module Warnings
      class InvalidRoleReference < BaseWarning
        def initialize(role_namespace:,
                       role_name:,
                       content_source:,
                       crn:)
          @role_namespace = role_namespace
          @role_name = role_name
          @content_source = content_source
          @crn = crn
          super
        end

        def title
          fqrn = "#{@role_namespace}.#{@role_name}"
          "Ansible role \"#{fqrn}\" not consumed by #{@crn.cr_name}"
        end

        def message
          <<~MESSAGE
            The #{@crn.class.name} with ID #{@crn.id} does not have the following Ansible role assigned to it:
            Role namespace: #{@role_namespace}
            Role name: #{@role_name}
            Ensure the lifecycle environment #{@content_source.cs_name} supplies this role.
          MESSAGE
        end
      end
    end
  end
end
