# frozen_string_literal: true

module ForemanAnsibleDirector
  module Api
    module V2
      class AssignmentsController < AnsibleDirectorApiController
        before_action :find_resource, only: %i[destroy]

        resource_description { resource_id 'AD Ansible Content Assignments' }

        # region ApiDoc: GET /api/v2/ansible_director/assignments/:target/:target_id
        api :GET, '/v2/ansible_director/assignments/:target/:target_id',
          N_('List Ansible content assignments for a target')
        # TRANSLATORS: ApiDoc, do not translate!
        description <<~DESC
          Retrieve all Ansible content units for a given target (host or hostgroup).
          This includes content inherited through the assignment hierarchy and direct assignments.
          If resolve is true, the server will try to map the assignment to an actual content unit available to target.
        DESC
        param :target,
          %w[host hostgroup],
          desc: N_('Type of the target entity.'),
          required: true
        param :target_id,
          :number,
          desc: N_('ID of the target entity.'),
          required: true
        param :resolve,
          :boolean,
          desc: N_('Resolve content units for assignments.'),
          required: false
        # TRANSLATORS: ApiDoc, do not translate!
        example <<~EXAMPLE
          GET /api/v2/ansible_director/assignments/host/1
        EXAMPLE
        # endregion
        def assignments
          target = ::ForemanAnsibleDirector::AssignmentService.find_target(
            target_type: params[:target],
            target_id: params[:target_id]
          )
          content_source_override = ::ForemanAnsibleDirector::LifecycleEnvironment.find_by(
            id: params[:cs_id_override]
          )

          @assignments,
            @resolved_assignments,
            @hierarchy,
            @effective_content_source = ::ForemanAnsibleDirector::AssignmentService.assignments_for(
              target: target,
              content_source_override: content_source_override,
              resolve: ::Foreman::Cast.to_bool(params[:resolve])
            )
        end

        def preresolve
          node_params = preresolve_params

          parent = if node_params[:parent].nil?
                     nil
                   else
                     ::ForemanAnsibleDirector::AssignmentService.find_target(
                       target_type: node_params[:parent][:parent_type],
                       target_id: node_params[:parent][:parent_id]
                     )
                   end

          assignments = node_params[:assignments]

          node_content_source = if node_params[:content_source].nil?
                                  nil
                                else
                                  ::ForemanAnsibleDirector::LifecycleEnvironment.find_by(
                                    id: node_params[:content_source][:cs_id]
                                  )
                                end

          @node_type = node_params[:type]

          @assignments,
            @resolved_assignments,
            @hierarchy,
            @effective_content_source = ::ForemanAnsibleDirector::AssignmentService.assignment_preresolve(
              parent: parent,
              node_assignments: assignments,
              node_cs: node_content_source,
              resolve: true
            )
        end

        # region ApiDoc: POST /api/v2/ansible_director/assignments/:target/:target_id
        api :POST, '/v2/ansible_director/assignments/:target/:target_id', N_('Assign Ansible content.')
        # TRANSLATORS: ApiDoc, do not translate!
        description <<~DESC
          Create Ansible content assignments for a target.
          An assignment represents an Ansible role or Ansible collection role.
          The version of this role is determined dynamically.
        DESC
        param :assignments, Array, desc: N_('Array of assignment objects.'), required: true do
          param :assignable_type,
            %w[ForemanAnsibleDirector::AnsibleCollectionRole ForemanAnsibleDirector::AnsibleRole],
            desc: N_('Type of the Ansible content unit.'),
            required: true
          param :assignable_namespace,
            String,
            desc: N_('Namespace of the Ansible content unit.'),
            required: true
          param :assignable_name,
            String,
            desc: N_('Name of the Ansible content unit.'),
            required: true
          param :assignable_role_name,
            String,
            desc: <<~DESC,
              Only required if assignable_type = "ForemanAnsibleDirector::AnsibleCollectionRole".
              An identifier of a role in the supplied collection.
              $assignable_namespace.$assignable_name.$assignable_role_name must form a fully qualified role name.
            DESC
            required: false
        end
        # TRANSLATORS: ApiDoc, do not translate!
        example <<~EXAMPLE
          {
            "assignments": [
              {
                "assignable_type": "ForemanAnsibleDirector::AnsibleCollectionRole",
                "assignable_namespace": "manala",
                "assignable_name": "roles",
                "assignable_role_name": "motd"
              }
            ]
          }
        EXAMPLE
        # endregion
        def assign
          target = ::ForemanAnsibleDirector::AssignmentService.find_target(
            target_type: params[:target],
            target_id: params[:target_id]
          )

          assignments = bulk_assignment_params
          ::ForemanAnsibleDirector::AssignmentService.create_bulk_assignments(
            target: target,
            assignments: assignments
          )
        end

        # region ApiDoc: DELETE /api/v2/ansible_director/assignments/:id
        api :DELETE, '/v2/ansible_director/assignments/:id', N_('Delete an Ansible content assignment')
        # TRANSLATORS: ApiDoc, do not translate!
        description <<~DESC
          Note: This deletes the assignment record but not the underlying Ansible content.
        DESC
        param :id,
          :number,
          desc: N_('ID of the assignment to delete.'),
          required: true
        # endregion
        def destroy
          ::ForemanAnsibleDirector::AssignmentService.destroy_assignment(@assignment)
        end

        private

        def resource_scope
          ::ForemanAnsibleDirector::AnsibleContentAssignment.all
        end

        def assignment_params
          params.require(:assignment).permit(
            source: %i[type id],
            target: %i[type id]
          )
        end

        def preresolve_params
          params.require(:node).permit(
            :type,
            parent: %i[parent_type parent_id],
            content_source: %i[cs_type cs_id],
            assignments: %i[
              assignable_type
              assignable_namespace
              assignable_name
              assignable_role_name
            ]
          )
        end

        def bulk_assignment_params
          return [] if params[:assignments].empty?

          params.require(:assignments).map do |assignment|
            assignment.permit(:assignable_type, :assignable_namespace, :assignable_name, :assignable_role_name)
          end
        end
      end
    end
  end
end
