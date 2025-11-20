# frozen_string_literal: true

module ForemanAnsibleDirector
  module Api
    module V2
      class AssignmentsController < AnsibleDirectorApiController
        before_action :find_resource, only: %i[destroy]
        before_action :find_resources, only: %i[assign]
        before_action :find_target, only: %i[assignments]

        def assignments
          @assignments = @target.resolved_ansible_content
        end

        def assign
          ::ForemanAnsibleDirector::AnsibleContentAssignment.create!(consumable: @source, assignable: @target)
        end

        def assign_bulk
          assignments = bulk_assignment_params
          cleared_targets = []
          ActiveRecord::Base.transaction do
            assignments.each do |assignment|
              source_finder = finder(assignment[:source][:type])
              target_finder = finder(assignment[:target][:type])
              source = source_finder.find_by(id: assignment[:source][:id])
              target = target_finder.find_by(id: assignment[:target][:id])

              unless target.id.in?(cleared_targets)
                ::ForemanAnsibleDirector::AnsibleContentAssignment.where(assignable: target).destroy_all
                cleared_targets.push(target.id)
              end
              ::ForemanAnsibleDirector::AnsibleContentAssignment.create!(consumable: source, assignable: target)
            end
          end
        end

        def destroy
          @assignment.destroy
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

        def find_resources
          assignment = assignment_params
          source_finder = finder(assignment[:source][:type])
          target_finder = finder(assignment[:target][:type])
          source = source_finder.find_by(id: assignment[:source][:id])
          target = target_finder.find_by(id: assignment[:target][:id])
          if source.nil?
            render_error(
              'custom_error',
              status: :unprocessable_entity,
              locals: {
                message: "Source object of type #{assignment[:source][:type]} with \
                          id #{assignment[:source][:id]} does not exist.",
              }
            )
          end
          if target.nil?
            render_error(
              'custom_error',
              status: :unprocessable_entity,
              locals: {
                message: "Target object of type #{assignment[:target][:type]} \
                with id #{assignment[:target][:id]} does not exist.",
              }
            )
          end
          @source = source
          @target = target
        end
      end
    end
  end
end
