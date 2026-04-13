# frozen_string_literal: true

module ForemanAnsibleDirector
  module Api
    module V2
      class AssignmentsController < AnsibleDirectorApiController
        before_action :find_resource, only: %i[destroy]

        resource_description { resource_id 'AD Ansible Content Assignments' }

        # region ApiDoc: GET /api/v2/ansible_director/assignments
        api :GET, '/v2/ansible_director/assignments', N_('List resolved Ansible content assignments for a target')
        # TRANSLATORS: ApiDoc, do not translate!
        description <<~DESC
          Retrieve all Ansible content units *resolved* for a given target (host or hostgroup).
          This includes content inherited through the assignment hierarchy or direct assignments.
        DESC
        param :target,
          %w[HOST HOSTGROUP],
          desc: N_('Type of the target entity.'),
          required: true
        param :target_id,
          :number,
          desc: N_('ID of the target entity.'),
          required: true
        # TRANSLATORS: ApiDoc, do not translate!
        example <<~EXAMPLE
          GET /api/v2/ansible_director/assignments?target=HOST&target_id=123
        EXAMPLE
        # endregion
        def assignments
          target = ::ForemanAnsibleDirector::AssignmentService.find_target(
            target_type: params[:target],
            target_id: params[:target_id]
          )
          # TODO: Null check target
          @assignments = target.resolved_ansible_content
        end

        # region ApiDoc: POST /api/v2/ansible_director/assignments
        api :POST, '/v2/ansible_director/assignments', N_('Assign Ansible content to a target')
        # TRANSLATORS: ApiDoc, do not translate!
        description <<~DESC
          Assign Ansible content from a source (e.g., a lifecycle environment) to a target.
        DESC
        param :assignment, Hash, desc: N_('Assignment definition'), required: true do
          param :source, Hash, desc: N_('Source (provider of content)'), required: true do
            param :type,
              %w[ACR],
              desc: N_('Type of source. Currently, only Ansible collection roles (ACR) are supported as sources.'),
              example: 'ACR',
              required: true
            param :id,
              :number,
              desc: N_('ID of the source entity.'),
              example: 5,
              required: true
          end
          param :target, Hash, desc: N_('Target (receiver of content)'), required: true do
            param :type,
              %w[HOST HOSTGROUP],
              desc: N_('Type of target. Both hosts (HOST) and hostgroups (HOSTGROUP) are supported as targets.'),
              example: 'HOST',
              required: true
            param :id,
              :number,
              desc: N_('ID of the target entity.'),
              example: 6,
              required: true
          end
        end
        # TRANSLATORS: ApiDoc, do not translate!
        example <<~EXAMPLE
          {
            "assignment": {
              "source": {
                "type": "ACR",
                "id": 109
              },
              "target": {
                "type": "HOST",
                "id": 1
              }
            }
          }
        EXAMPLE
        # endregion
        def assign
          assignment = assignment_params

          source = ::ForemanAnsibleDirector::AssignmentService.find_target(
            target_type: assignment[:source][:type],
            target_id: assignment[:source][:id]
          )

          target = ::ForemanAnsibleDirector::AssignmentService.find_target(
            target_type: assignment[:target][:type],
            target_id: assignment[:target][:id]
          )

          ::ForemanAnsibleDirector::AssignmentService.create_assignment(
            consumable: source,
            assignable: target
          )
        end

        # region ApiDoc: POST /api/v2/ansible_director/assignments/bulk
        api :POST, '/v2/ansible_director/assignments/bulk', N_('Bulk assign Ansible content')
        # TRANSLATORS: ApiDoc, do not translate!
        description <<~DESC
          Bulk-assign Ansible content from a source (e.g., a lifecycle environment) to targets.
          Equivalent to calling `/assign` multiple times.
        DESC
        param :assignments, Array, desc: N_('Array of assignment objects'), required: true do
          param :source, Hash, desc: N_('Source (provider of content)'), required: true do
            param :type,
              %w[ACR],
              desc: N_('Type of source. Currently, only Ansible collection roles (ACR) are supported as sources.'),
              example: 'ACR',
              required: true
            param :id,
              :number,
              desc: N_('ID of the source entity.'),
              example: 5,
              required: true
          end
          param :target, Hash, desc: N_('Target (receiver of content)'), required: true do
            param :type,
              %w[HOST HOSTGROUP],
              desc: N_('Type of target. Both hosts (HOST) and hostgroups (HOSTGROUP) are supported as targets.'),
              example: 'HOST',
              required: true
            param :id,
              :number,
              desc: N_('ID of the target entity.'),
              example: 6,
              required: true
          end
        end
        # TRANSLATORS: ApiDoc, do not translate!
        example <<~EXAMPLE
          {
            "assignments": [
              {
                "source": {
                  "type": "ACR",
                  "id": 109
                },
                "target": {
                  "type": "HOST",
                  "id": 1
                }
              }
            ]
          }
        EXAMPLE
        # endregion
        def assign_bulk
          assignments = bulk_assignment_params
          ::ForemanAnsibleDirector::AssignmentService.create_bulk_assignments(
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

        def bulk_assignment_params
          return [] if params[:assignments].empty?

          params.require(:assignments).map do |assignment|
            assignment.permit(
              source: %i[type id],
              target: %i[type id]
            )
          end
        end
      end
    end
  end
end
