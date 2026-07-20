# frozen_string_literal: true

module ForemanAnsibleDirector
  class AssignmentService < AnsibleDirectorService
    class << self
      def destroy_assignment(assignment)
        ActiveRecord::Base.transaction do
          assignment.destroy
        end
      end

      def create_assignment(target:,
                            assignment:)
        ActiveRecord::Base.transaction do
          ::ForemanAnsibleDirector::AnsibleContentAssignment.create!(
            consumable: target,
            assignable_type: assignment[:assignable_type],
            assignable_namespace: assignment[:assignable_namespace],
            assignable_name: assignment[:assignable_name],
            assignable_role_name: if assignment[:assignable_type] == 'ForemanAnsibleDirector::AnsibleCollectionRole'
                                    assignment[:assignable_role_name]
                                  end
          )
        end
      end

      def create_bulk_assignments(target:, assignments:)
        ActiveRecord::Base.transaction do
          assignments.each do |assignment|
            create_assignment(target: target, assignment: assignment)
          end
        end
      end

      def finder(type:)
        case type

        when 'host'
          Host
        when 'hostgroup'
          Hostgroup
        else
          # TODO: Actual error message
          raise "Invalid type: #{type}"
        end
      end

      def find_target(target_type:, target_id:)
        finder = finder(type: target_type)
        finder.find_by!(id: target_id)
      end

      def assignments_for(target:, content_source_override: nil, resolve: false)
        content_source, = content_source_override || content_source_for(target)
        resolved_assignments, hierarchy = recurse_content_assignments(target)

        return [resolved_assignments, nil, hierarchy, nil] unless resolve && content_source

        resolved = resolve_content_units(content_source, resolved_assignments)

        [resolved_assignments, resolved, hierarchy, content_source]
      end

      def assignment_preresolve(parent: nil, node_assignments: [], node_cs: nil, resolve: false)
        resolved_assignments = node_assignments
        hierarchy = []
        content_source = node_cs

        if parent
          parent_assignments, hierarchy = recurse_content_assignments(parent)
          resolved_assignments = merge_assignments parent_assignments, resolved_assignments
          content_source, = content_source_for(parent) unless content_source
        end

        return resolved_assignments, nil, hierarchy unless resolve && content_source

        resolved = resolve_content_units(content_source, resolved_assignments)

        [resolved_assignments, resolved, hierarchy, content_source]
      end

      def content_source_for(target, hierarchy = [])
        return [nil, hierarchy] if target.nil?

        hierarchy << target

        if target.cr_content_source
          return [target.cr_content_source,
                  hierarchy]
        elsif target.cr_content_source_state == 'none'
          return [nil, hierarchy]
        end

        content_source_for target.cr_immediate_predecessor, hierarchy
      end

      private

      def recurse_content_assignments(target, hierarchy = [])
        node_predecessor = target.cr_immediate_predecessor

        hierarchy << target

        if node_predecessor.nil?
          node_assignments = target.cr_content_assignments
          return node_assignments, hierarchy
        end

        upper_assignments, hierarchy = recurse_content_assignments(node_predecessor, hierarchy)
        [merge_assignments(upper_assignments, target.cr_content_assignments), hierarchy]
      end

      def merge_assignments(preceding_assignments, assignments)
        merged_hash = {}

        preceding_assignments.each do |assignment|
          assignment_key = [
            assignment[:assignable_namespace],
            assignment[:assignable_name],
            assignment[:assignable_role_name],
            assignment[:assignable_type],
          ]
          merged_hash[assignment_key] = assignment
        end

        assignments.each do |assignment|
          assignment_key = [
            assignment[:assignable_namespace],
            assignment[:assignable_name],
            assignment[:assignable_role_name],
            assignment[:assignable_type],
          ]

          if assignment[:subtractive]
            merged_hash.delete(assignment_key)
          else
            merged_hash[assignment_key] = assignment
          end
        end

        merged_hash.values
      end

      def resolve_content_units(content_source, assignments)
        cs_content_unit_versions = content_source.cs_content_unit_versions

        role_lookup = {}
        collection_role_lookup = {}

        cs_content_unit_versions.each do |cuv|
          versionable = cuv.versionable

          case versionable.class.name
          when 'ForemanAnsibleDirector::AnsibleRole'
            key = [versionable.namespace, versionable.name]
            role_lookup[key] = cuv

          when 'ForemanAnsibleDirector::AnsibleCollection'

            cuv.ansible_collection_roles.each do |collection_role|
              role_key = [
                versionable.namespace,
                versionable.name,
                collection_role.name,
              ]
              collection_role_lookup[role_key] = collection_role
            end
          end
        end

        matched = []

        assignments.each do |assignment|
          namespace = assignment[:assignable_namespace]
          name = assignment[:assignable_name]
          role_name = assignment[:assignable_role_name]
          type = assignment[:assignable_type]

          case type
          when 'ForemanAnsibleDirector::AnsibleCollectionRole'

            acr_key = [namespace, name, role_name]
            collection_role = collection_role_lookup[acr_key]

            if collection_role

              matched << {
                type: type,
                assignment: assignment,
                cuv: collection_role,
              }
            else
              ctx.add_warning(::ForemanAnsibleDirector::Issues::Warnings::NoResolutionCandidateForCollectionRole.new(
                collection_name: name,
                collection_namespace: namespace,
                collection_role_identifier: role_name,
                content_source: content_source,
                assignment_id: assignment.respond_to?(:id) ? assignment.id : 'preresolved'
              ))
            end

          when 'ForemanAnsibleDirector::AnsibleRole'
            base_key = [namespace, name]
            if role_lookup.key?(base_key)
              cu_version = role_lookup[base_key]
              matched << {
                type: type,
                assignment: assignment,
                cuv: cu_version,
              }
            else
              ctx.add_warning(::ForemanAnsibleDirector::Issues::Warnings::NoResolutionCandidateForRole.new(
                role_name: name,
                role_namespace: namespace,
                content_source: content_source,
                assignment_id: assignment.respond_to?(:id) ? assignment.id : 'preresolved'
              ))
            end
          end
        end

        matched
      end
    end
  end
end
