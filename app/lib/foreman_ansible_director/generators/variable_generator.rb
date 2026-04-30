# frozen_string_literal: true

module ForemanAnsibleDirector
  module Generators
    class VariableGenerator
      class << self
        def generate(host:, resolved_host_content:)
          variables = {}

          resolved_host_content.each do |content_assignment|
            consumable = content_assignment[:cuv]
            next unless consumable
            resolved = consumable.ansible_variables.values_hash(host).raw

            if consumable.is_a? ForemanAnsibleDirector::AnsibleCollectionRole
              acv = consumable.ansible_collection_version
              ac = acv.versionable
              fqrn = "#{ac.namespace}.#{ac.name}.#{consumable.name}"
            else
              ar = consumable.versionable
              fqrn = "#{ar.namespace}.#{ar.name}"
            end

            role_variables = {}
            resolved.each do |_, resolved_variable_value|
              resolved_variable_value.each do |key, value|
                role_variables[key] = value[:value]
              end
            end

            variables[fqrn] = role_variables
          end

          variables
        end
      end
    end
  end
end
