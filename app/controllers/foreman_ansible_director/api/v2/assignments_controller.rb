# frozen_string_literal: true

module ForemanAnsibleDirector
  module Api
    module V2
      class AssignmentsController < AnsibleDirectorApiController
        before_action :find_resource, only: %i[destroy]

        resource_description do
          resource_id 'assignments'
          api_version 'v2'
          api_base_url '/ansible_director'
        end

        api :GET, '/assignments/:target/:target_id', N_('List assignments for a target')
        param :target, String, required: true, desc: N_('Target type')
        param :target_id, :identifier_dottable, required: true

        def assignments
          target = ::ForemanAnsibleDirector::AssignmentService.find_target(
            target_type: params[:target],
            target_id: params[:target_id]
          )
          # TODO: Null check target
          @assignments = target.resolved_ansible_content
        end

        api :POST, '/assignments/', N_('Assign ansible content')
        param :assignment, Hash, required: true do
          param :source, Hash, required: true do
            param :type, String, required: true
            param :id, :identifier_dottable, required: true
          end
          param :target, Hash, required: true do
            param :type, String, required: true
            param :id, :identifier_dottable, required: true
          end
        end

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

        api :POST, '/assignments/bulk', N_('Assign ansible content in bulk')
        param :assignments, Array, required: true, desc: N_('List of assignments')

        def assign_bulk
          assignments = bulk_assignment_params
          ::ForemanAnsibleDirector::AssignmentService.create_bulk_assignments(
            assignments: assignments
          )
        end

        api :DELETE, '/assignments/:id', N_('Remove assignment')
        param :id, :identifier_dottable, required: true

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
