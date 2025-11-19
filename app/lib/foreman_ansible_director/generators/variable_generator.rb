# frozen_string_literal: true

module Generators
  class VariableGenerator
    class << self
      def generate(host)
        host_content = host.ansible_content_assignments
        variables = {}

        host_content.each do |content_assignment|
          next unless content_assignment.consumable.is_a? AnsibleCollectionRole

          collection_role = content_assignment.consumable

          resolved = collection_role.ansible_variables.values_hash(host).raw
          collection = collection_role.ansible_collection_version.versionable

          role_variables = {}
          resolved.each do |_, resolved_variable_value|
            resolved_variable_value.each do |key, value|
              role_variables[key] = value[:value]
            end
          end

          variables["#{collection.namespace}.#{collection.name}.#{collection_role.name}"] = role_variables

          # else # content_assignment.consumable.is_a? AnsibleRole
        end

        variables
      end
    end
  end
end
