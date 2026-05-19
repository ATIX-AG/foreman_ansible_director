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
            resolved = consumable.ansible_variables.values_hash(host)
            role_variables = consumable.ansible_variables.to_a

            if consumable.is_a? ForemanAnsibleDirector::AnsibleCollectionRole
              acv = consumable.ansible_collection_version
              ac = acv.versionable
              fqrn = "#{ac.namespace}.#{ac.name}.#{consumable.name}"
            else
              ar = consumable.versionable
              fqrn = "#{ar.namespace}.#{ar.name}"
            end

            host_role_variables = {}
            role_variables.each do |variable|
              value = resolved[variable]
              host_role_variables[variable.key] = value unless value.nil?
            end

            variables[fqrn] = host_role_variables
          end

          variables
        end
      end
    end
  end
end
