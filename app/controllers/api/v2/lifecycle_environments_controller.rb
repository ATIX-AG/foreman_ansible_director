# frozen_string_literal: true

module Api
  module V2
    class LifecycleEnvironmentsController < PulsibleApiController
      include ::Api::Version2

      before_action :find_resource, only: %i[show update destroy update_content]
      before_action :find_path, only: %i[create update]
      before_action :find_organization, only: %i[create update_content]

      def show
      end

      def create
        permitted_params = lifecycle_environment_params
        position = permitted_params.delete(:position)
        @lifecycle_environment = LifecycleEnvironment.new(permitted_params)
        @lifecycle_environment.organization = @organization
        @lifecycle_environment_path.insert_at_position(@lifecycle_environment, position || 0)
      end

      def update
        permitted_params = lifecycle_environment_params
        content_params = permitted_params.delete(:content)

        if content_params
          unless @lifecycle_environment.root?
            ancestor_names = @lifecycle_environment.ancestors.pluck(:name).join(', ')
            error_message = "LCE #{@lifecycle_environment.name} is not the head link in path " \
              "#{@lifecycle_environment_path.name}. It is preceded by #{ancestor_names}."

            render_error('custom_error',
              status: :unprocessable_entity,
              locals: { message: error_message })
            return
          end

          success = true
          ActiveRecord::Base.transaction do
            content_params[:content_assignments].each do |assignment|
              unit = ContentUnit.find(assignment[:id])
              unit_version = unit.content_unit_versions.find_by!(version: assignment[:version])
              success &&= @lifecycle_environment.assign_content_unit_version!(unit_version)
            end
            success &&= @lifecycle_environment.assign_execution_environment!(content_params[:execution_environment_id])
            success &&= @lifecycle_environment.update(permitted_params) if success

            raise ActiveRecord::Rollback unless success
          end
        else
          success = @lifecycle_environment.update(permitted_params)
        end

        if success
          # render success response (your existing success logic)
        else
          render_error('custom_error', status: :unprocessable_entity,
                       locals: { message: @lifecycle_environment.flatten_errors })
        end
      end

      def update_content
        content_params = content_assignments_params

        if content_params
          unless @lifecycle_environment.root?
            ancestor_names = @lifecycle_environment.ancestors.pluck(:name).join(', ')
            error_message = "LCE #{@lifecycle_environment.name} is not the head link in path " \
              "#{@lifecycle_environment_path.name}. It is preceded by #{ancestor_names}."

            render_error('custom_error',
              status: :unprocessable_entity,
              locals: { message: error_message })
            return
          end

          success = true
          ActiveRecord::Base.transaction do
            content_params[:content_assignments].each do |assignment|
              unit = ContentUnit.find(assignment[:id])
              unit_version = unit.content_unit_versions.find_by!(version: assignment[:version])
              success &&= @lifecycle_environment.assign_content_unit_version!(unit_version)
            end
            if (ee_id = content_params[:execution_environment_id])
              success &&= @lifecycle_environment.assign_execution_environment!(ee_id)
            end
            # success &&= @lifecycle_environment.update(permitted_params) if success

            raise ActiveRecord::Rollback unless success
          end
        else
          success = false
        end

        if success
          # render success response (your existing success logic)
        else
          render_error('custom_error', status: :unprocessable_entity,
                       locals: { message: @lifecycle_environment.flatten_errors })
        end
      end

      def destroy
      end

      def resource_scope
        LifecycleEnvironment.all
      end

      private

      def lifecycle_environment_params
        params.require(:lifecycle_environment).permit(
          :name,
          :description,
          :position,
          :protected,
          content: [
            :execution_environment_id,
            { content_assignments: %i[id version] },
          ]
        ).merge(
          lifecycle_environment_path_id: params[:lifecycle_environment_path_id],
          organization_id: params[:organization_id]
        )
      end

      def content_assignments_params
        params.permit(:organization_id,
          :execution_environment_id,
          content_assignments: %i[id version content_unit_version_id])
      end

      def find_path
        @lifecycle_environment_path = LifecycleEnvironmentPath.find(params[:lifecycle_environment_path_id])
      end
    end
  end
end
