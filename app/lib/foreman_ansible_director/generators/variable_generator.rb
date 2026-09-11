# frozen_string_literal: true

module ForemanAnsibleDirector
  module Generators
    class VariableGenerator
      class << self
        def generate(resolved_host_variables:)
          variable_files = {}

          resolved_host_variables.each do |cu_variables|
            assignment = cu_variables[:assignment]
            variables = cu_variables[:variables]

            stream = Psych::Nodes::Stream.new
            document = Psych::Nodes::Document.new
            root_mapping = Psych::Nodes::Mapping.new

            variables.each do |variable|
              mapping = Psych::Nodes::Mapping.new
              mapping.children << Psych::Nodes::Scalar.new(variable[:name])

              effective_raw_value = if !variable[:binding].nil?
                                      variable[:binding][:raw_value]
                                    else
                                      variable[:raw_value]
                                    end

              raw_value_ast = YAML.parse(effective_raw_value)

              key_node = Psych::Nodes::Scalar.new(variable[:name])
              value_node = raw_value_ast.children.first

              root_mapping.children << key_node
              root_mapping.children << value_node
            end

            document.children << root_mapping
            stream.children << document

            namespace = assignment[:assignable_namespace]
            name = assignment[:assignable_name]
            if assignment[:assignable_type] == 'ForemanAnsibleDirector::AnsibleCollectionRole'
              role_name = assignment[:assignable_role_name]
              cu_key = "#{namespace}.#{name}.#{role_name}_vars.yaml"
            else
              cu_key = "#{namespace}.#{name}_vars.yaml"
            end

            variable_files[cu_key] = Base64.encode64(stream.to_yaml)
          end

          variable_files
        end
      end
    end
  end
end
