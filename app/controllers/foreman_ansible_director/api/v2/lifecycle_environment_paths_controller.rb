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

          ::ForemanAnsibleDirector::LifecycleEnvironmentPathService.create_path(
            name: permitted_params[:name],
            description: permitted_params[:description],
            organization_id: @organization.id
          )
        end

        def update
          permitted_params = lifecycle_environment_path_params

          ::ForemanAnsibleDirector::LifecycleEnvironmentPathService.edit_path(
            lce_path: @lifecycle_environment_path,
            name: permitted_params[:name],
            description: permitted_params[:description]
          )
        end

        def destroy
          ::ForemanAnsibleDirector::LifecycleEnvironmentPathService.destroy_path(
            @lifecycle_environment_path
          )
        end

        def promote
          permitted_params = promote_params

          ::ForemanAnsibleDirector::LifecycleEnvironmentPathService.promote(
            lce_path: @lifecycle_environment_path,
            source_environment_id: permitted_params[:source_environment_id],
            target_environment_id: permitted_params[:target_environment_id]
          )
        end

        def model_of_controller
          resource_class
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
