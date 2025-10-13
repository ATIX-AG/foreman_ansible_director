# frozen_string_literal: true

module Api
  module V2
    class AssignmentsController < AnsibleDirectorApiController
      before_action :find_resource, only: %i[destroy]
      before_action :find_resources, only: %i[assign]
      before_action :find_target, only: %i[find_assignments]

      def find_assignments
        @assignments = @target.resolved_ansible_content
        a = 2
      end

      def assign
        AnsibleContentAssignment.create!(consumable: @source, assignable: @target)
      end

      def assign_bulk
        assignments = bulk_assignment_params
        ActiveRecord::Base.transaction do
          assignments.each do |assignment|
            source_finder = finder(assignment[:source][:type])
            target_finder = finder(assignment[:target][:type])
            source = source_finder.find_by(id: assignment[:source][:id])
            target = target_finder.find_by(id: assignment[:target][:id])

            AnsibleContentAssignment.where(assignable: target).destroy_all
            AnsibleContentAssignment.create!(consumable: source, assignable: target)
          end
        end
      end

      def destroy
        @assignment.destroy
      end

      private

      def resource_scope
        AnsibleContentAssignment.all
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
            source: [:type, :id],
            target: [:type, :id]
          )
        end

      end

      def finder(type)
        case type

        when 'ACR'
          # @assignment_class = AnsibleContentAssignmentCollectionRole
          AnsibleCollectionRole
        when 'CONTENT'
          ContentUnitVersion
        when 'HOST'
          Host::Managed
        when 'HOSTGROUP'
          Hostgroup
        else
          render_error('custom_error', status: :unprocessable_entity,
                       locals: { message: "#{type} is not supported." })
        end
      end

      def find_resources
        assignment = assignment_params
        source_finder = finder(assignment[:source][:type])
        target_finder = finder(assignment[:target][:type])
        source = source_finder.find_by(id: assignment[:source][:id])
        target = target_finder.find_by(id: assignment[:target][:id])
        if source.nil?
          message = "Source object of type #{assignment[:source][:type]} " \
          "with id #{assignment[:source][:id]} does not exist."
          render_error('custom_error', status: :unprocessable_entity,
                       locals: { message: message })
        end
        if target.nil?
          message = "Target object of type #{assignment[:target][:type]} " \
            "with id #{assignment[:target][:id]} does not exist."
          render_error('custom_error', status: :unprocessable_entity,
                       locals: { message: message })
        end
        @source = source
        @target = target
      end

      def find_target
        finder = finder params[:target]
        @target = finder.find_by(id: params[:target_id])
      end
    end
  end
end
