# frozen_string_literal: true

module Api
  module V2
    class AssignmentsController < AnsibleDirectorApiController
      before_action :find_resources, only: %i[assign]
      before_action :find_target, only: %i[find_assignments]

      def find_assignments
        @assignments = @target.resolved_ansible_content
      end

      def assign
        @assignment_class.create!(consumable: @source, assignable: @target)
      end

      private

      def assignment_params
        params.require(:assignment).permit(
          source: %i[type id],
          target: %i[type id]
        )
      end

      def finder(type)
        @assignment_class = AnsibleContentAssignment
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
