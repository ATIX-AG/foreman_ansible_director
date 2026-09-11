# frozen_string_literal: true

module ForemanAnsibleDirector
  class VariableService < AnsibleDirectorService
    class << self
      def create_variable(name:,
                          data_type:,
                          raw_value:,
                          owner:,
                          query: 0,
                          query_data: {},
                          transformer: 0,
                          transformer_data: {})
        ActiveRecord::Base.transaction do
          ::ForemanAnsibleDirector::AnsibleVariable.create!(
            name: name,
            raw_value: raw_value,
            data_type: data_type,
            query: query,
            query_data: query_data,
            transformer: transformer,
            transformer_data: transformer_data,
            ownable: owner
          )
        end
      end

      def edit_variable(variable:,
                        **args)
        ActiveRecord::Base.transaction do
          variable.update!(
            args
          )
        end
      end

      def create_override(variable:,
                          value:,
                          matcher:,
                          matcher_value:)
        ActiveRecord::Base.transaction do
          LookupValue.create!(
            match: "#{matcher}=#{matcher_value}",
            value: value,
            lookup_key_id: variable.id
          )
        end
      end

      def edit_override(override:,
                        value:,
                        matcher:,
                        matcher_value:)
        ActiveRecord::Base.transaction do
          override.update!(
            match: "#{matcher}=#{matcher_value}",
            value: value
          )
        end
      end

      def destroy_override(override)
        ActiveRecord::Base.transaction do
          override.destroy!
        end
      end

      def resolve_single(assignable_type:,
                         assignable_name:,
                         assignable_namespace:,
                         variable_name:,
                         target:,
                         assignable_role_name: nil)
        composite_key = [assignable_type, assignable_namespace, assignable_name, assignable_role_name]

        _, resolved_assignments, _, content_source = ::ForemanAnsibleDirector::AssignmentService.assignments_for(
          target: target,
          resolve: true
        )

        applicable_assignments = resolved_assignments.select do |resolved_assignment|
          assignment = resolved_assignment[:assignment]
          assignment_key = [assignment[:assignable_type], assignment[:assignable_namespace],
                            assignment[:assignable_name], assignment[:assignable_role_name]]

          assignment_key == composite_key
        end

        # region IssueHandling:
        if applicable_assignments.length != 1
          if assignable_type == 'ForemanAnsibleDirector::AnsibleRole'
            ctx.add_warning(
              ::ForemanAnsibleDirector::Issues::Warnings::InvalidRoleReference.new(
                role_name: assignable_name,
                role_namespace: assignable_namespace,
                content_source: content_source,
                crn: target
              )
            )
          else
            ctx.add_warning(
              ::ForemanAnsibleDirector::Issues::Warnings::InvalidCollectionRoleReference.new(
                collection_name: assignable_name,
                collection_namespace: assignable_namespace,
                collection_role_name: assignable_role_name,
                content_source: content_source,
                crn: target
              )
            )
          end
          return [[], nil]
        end

        referenced_variable = applicable_assignments[0][:cuv].ansible_variables.find_by(name: variable_name)
        unless referenced_variable
          if assignable_type == 'ForemanAnsibleDirector::AnsibleRole'
            ctx.add_warning(
              ::ForemanAnsibleDirector::Issues::Warnings::InvalidRoleVariableRef.new(
                variable_name: variable_name,
                role_name: assignable_name,
                role_namespace: assignable_namespace,
                role_version: applicable_assignments[0][:cuv],
                crn: target
              )
            )
          else
            ctx.add_warning(
              ::ForemanAnsibleDirector::Issues::Warnings::InvalidCollectionRoleVariableRef.new(
                variable_name: variable_name,
                collection_name: assignable_name,
                collection_namespace: assignable_namespace,
                collection_role_name: assignable_role_name,
                collection_version: applicable_assignments[0][:cuv].ansible_collection_version,
                crn: target
              )
            )

          end
          return [[], nil]
        end
        # endregion

        hierarchical_bindings = collect_hierarchical_bindings(assignable_type: assignable_type,
          assignable_name: assignable_name,
          assignable_namespace: assignable_namespace,
          assignable_role_name: assignable_role_name,
          target: target,
          variable_name: variable_name)
        [hierarchical_bindings, referenced_variable]
      end

      def collect_hierarchical_bindings(assignable_type:,
                                        assignable_name:,
                                        assignable_namespace:,
                                        variable_name:,
                                        target:,
                                        assignable_role_name: nil,
                                        collected_bindings: [])
        node_predecessor = target.cr_immediate_predecessor

        if node_predecessor.nil?
          node_bindings = target.cr_variable_bindings
          applicable = node_bindings.find_by(
            assignable_type: assignable_type,
            assignable_name: assignable_name,
            assignable_namespace: assignable_namespace,
            assignable_role_name: assignable_role_name,
            variable_name: variable_name
          )

          collected_bindings << { binding: applicable, node: target }
          return collected_bindings
        end

        upper_bindings = collect_hierarchical_bindings(
          assignable_type: assignable_type,
          assignable_name: assignable_name,
          assignable_namespace: assignable_namespace,
          target: node_predecessor,
          variable_name: variable_name,
          assignable_role_name: assignable_role_name
        )

        node_bindings = target.cr_variable_bindings
        applicable = node_bindings.find_by(
          assignable_type: assignable_type,
          assignable_name: assignable_name,
          assignable_namespace: assignable_namespace,
          assignable_role_name: assignable_role_name,
          variable_name: variable_name
        )

        collected_bindings << { binding: applicable, node: target }

        [*upper_bindings, *collected_bindings]
      end

      def recurse_variable_bindings(target, hierarchy = [])
        node_predecessor = target.cr_immediate_predecessor

        hierarchy << target

        if node_predecessor.nil?
          node_bindings = target.cr_variable_bindings
          return node_bindings, hierarchy
        end

        upper_bindings, hierarchy = recurse_variable_bindings(node_predecessor, hierarchy)
        [merge_bindings(upper_bindings, target.cr_variable_bindings), hierarchy]
      end

      def merge_bindings(preceding_bindings, bindings)
        merged_hash = {}

        preceding_bindings.each do |assignment|
          assignment_key = [
            assignment[:assignable_namespace],
            assignment[:assignable_name],
            assignment[:assignable_role_name],
            assignment[:assignable_type],
          ]
          merged_hash[assignment_key] = assignment
        end

        bindings.each do |assignment|
          assignment_key = [
            assignment[:assignable_namespace],
            assignment[:assignable_name],
            assignment[:assignable_role_name],
            assignment[:assignable_type],
          ]

          merged_hash[assignment_key] = assignment
        end

        merged_hash.values
      end

      def variables_for(target:, resolve: false)
        resolved_bindings, hiera = recurse_variable_bindings(target)

        return [resolved_bindings, nil, hiera] unless resolve

        resolved_variables = resolve_values(target: target, resolved_bindings: resolved_bindings)

        [resolved_bindings, resolved_variables, hiera]
      end

      def resolve_values(target:, resolved_bindings:)
        _, resolved_assignments, = ::ForemanAnsibleDirector::AssignmentService.assignments_for(
          target: target,
          resolve: true
        )

        variable_lookup = {}
        variable_binding_lookup = Hash.new { |h, k| h[k] = {} }

        resolved_assignments.each do |resolved_assignment|
          assignment = resolved_assignment[:assignment]
          cuv = resolved_assignment[:cuv]
          variables = {}

          cuv.ansible_variables.each do |variable|
            variables[variable[:name]] = variable
          end

          key = [assignment[:assignable_type], assignment[:assignable_namespace], assignment[:assignable_name],
                 assignment[:assignable_role_name]]
          variable_lookup[key] = {
            assignment: assignment,
            variables: variables,
          }
        end

        resolved_bindings.each do |binding|
          key = [binding[:assignable_type], binding[:assignable_namespace], binding[:assignable_name],
                 binding[:assignable_role_name]]
          var_bindings = variable_binding_lookup[key]
          var_bindings[binding[:variable_name]] = binding
        end

        mapped = []

        variable_lookup.each do |key, v|
          assignment = v[:assignment]
          variables = v[:variables]

          effective_variables = []

          variables.each do |variable_name, variable|
            used_binding = nil
            unless (binding = variable_binding_lookup[key][variable_name]).nil?
              used_binding = binding
              variable_binding_lookup.delete(key)
            end
            effective_variables << {
              id: variable[:id],
              name: variable[:name],
              data_type: variable[:data_type],
              raw_value: variable[:raw_value],
              binding: used_binding,
            }
          end

          mapped << {
            assignment: assignment,
            variables: effective_variables,
          }
        end
        mapped
      end
    end
  end
end
