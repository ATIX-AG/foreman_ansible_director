# frozen_string_literal: true

module ForemanAnsibleDirector
  module Api
    module V2
      class LifecycleEnvironmentPathsController < AnsibleDirectorApiController
        include ::Api::Version2

        before_action :find_resource, only: %i[promote update destroy]
        before_action :find_organization, only: %i[create]

        def index
          @lifecycle_environment_paths = resource_scope_for_index
        end

        def create
          permitted_params = lifecycle_environment_path_params
          begin
            ActiveRecord::Base.transaction do
              @lifecycle_environment_path = ::ForemanAnsibleDirector::LifecycleEnvironmentPath.new(permitted_params)
              @lifecycle_environment_path.organization = @organization
              @lifecycle_environment_path.save!
            end
          rescue ActiveRecord::RecordInvalid
            render_error('custom_error', status: :unprocessable_entity,
                         locals: { message: @lifecycle_environment_path.flatten_errors })
          end
        end

        def update
          permitted_params = lifecycle_environment_path_params
          begin
            ActiveRecord::Base.transaction do
              @lifecycle_environment_path.update!(permitted_params)
            end
          rescue ActiveRecord::RecordInvalid
            render_error('custom_error', status: :unprocessable_entity,
                         locals: { message: @lifecycle_environment_path.flatten_errors })
          end
        end

        def destroy
          ActiveRecord::Base.transaction do # TODO: Rollback if any LCE is used by host; Setting
            @lifecycle_environment_path.update!(root_environment_id: nil)
            @lifecycle_environment_path.destroy!
          end
        end

        def promote
          permitted_params = promote_params
          unless @lifecycle_environment_path.promote(permitted_params[:source_environment_id],
            permitted_params[:target_environment_id])
            render_error('custom_error', status: :unprocessable_entity,
                         locals: { message: @lifecycle_environment_path.flatten_errors })
          end
        end

        private

        def lifecycle_environment_path_params
          params.require(:lifecycle_environment_path).permit(
            :name,
            :description
          )
        end

        def promote_params
          params.require(:promote).permit(
            :source_environment_id,
            :target_environment_id
          )
        end

        def resource_class
          ::ForemanAnsibleDirector::LifecycleEnvironmentPath
        end
      end
    end
  end
end
