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

          path_create = ::ForemanAnsibleDirector::Structs::LifecycleEnvironmentPath::LifecycleEnvironmentPathCreate.new(
            permitted_params[:name],
            permitted_params[:description],
            @organization.id
          )
          ::ForemanAnsibleDirector::LifecycleEnvironmentPathService.create_path(path_create)
        end

        def update
          permitted_params = lifecycle_environment_path_params
          path_update = ::ForemanAnsibleDirector::Structs::LifecycleEnvironmentPath::LifecycleEnvironmentPathEdit.new(
            permitted_params[:name],
            permitted_params[:description]
          )

          ::ForemanAnsibleDirector::LifecycleEnvironmentPathService.edit_path(@lifecycle_environment_path, path_update)
        end

        def destroy
          ::ForemanAnsibleDirector::LifecycleEnvironmentPathService.destroy_path(
            @lifecycle_environment_path
          )
        end

        def promote
          permitted_params = promote_params

          path_promote =
            ::ForemanAnsibleDirector::Structs::LifecycleEnvironmentPath::LifecycleEnvironmentPathPromote.new(
              permitted_params[:source_environment_id],
              permitted_params[:target_environment_id]
            )

          ::ForemanAnsibleDirector::LifecycleEnvironmentPathService.promote(
            @lifecycle_environment_path,
            path_promote
          )
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
