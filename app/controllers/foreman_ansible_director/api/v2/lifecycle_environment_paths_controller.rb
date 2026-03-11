# frozen_string_literal: true

module ForemanAnsibleDirector
  module Api
    module V2
      class LifecycleEnvironmentPathsController < AnsibleDirectorApiController
        include ::Api::Version2

        before_action :find_resource, only: %i[promote update destroy]
        before_action :find_organization, only: %i[create]

        resource_description do
          resource_id 'lifecycle_environment_paths'
          api_version 'v2'
          api_base_url '/ansible_director'
          param :organization_id, Integer, show: false
        end

        api :GET, '/lifecycle_environments/paths/', N_('List lifecycle environment paths')
        param_group :search_and_pagination, ::Api::V2::BaseController
        add_scoped_search_description_for(::ForemanAnsibleDirector::LifecycleEnvironmentPath)

        def index
          @lifecycle_environment_paths = resource_scope_for_index
        end

        api :POST, '/lifecycle_environments/paths/', N_('Create lifecycle environment path')
        param :organization_id, Integer, required: true
        param :lifecycle_environment_path, Hash, required: true do
          param :name, String, required: true
          param :description, String, required: false
        end

        def create
          permitted_params = lifecycle_environment_path_params

          ::ForemanAnsibleDirector::LifecycleEnvironmentPathService.create_path(
            name: permitted_params[:name],
            description: permitted_params[:description],
            organization_id: @organization.id
          )
        end

        api :PUT, '/lifecycle_environments/paths/:id', N_('Update lifecycle environment path')
        param :id, :identifier_dottable, required: true
        param :lifecycle_environment_path, Hash, required: true do
          param :name, String, required: false
          param :description, String, required: false
        end

        def update
          permitted_params = lifecycle_environment_path_params

          ::ForemanAnsibleDirector::LifecycleEnvironmentPathService.edit_path(
            lce_path: @lifecycle_environment_path,
            name: permitted_params[:name],
            description: permitted_params[:description]
          )
        end

        api :DELETE, '/lifecycle_environments/paths/:id', N_('Delete lifecycle environment path')
        param :id, :identifier_dottable, required: true

        def destroy
          ::ForemanAnsibleDirector::LifecycleEnvironmentPathService.destroy_path(
            @lifecycle_environment_path
          )
        end

        api :POST, '/lifecycle_environments/paths/:id/promote', N_('Promote lifecycle environment path')
        param :id, :identifier_dottable, required: true
        param :promote, Hash, required: true do
          param :source_environment_id, :identifier_dottable, required: true
          param :target_environment_id, :identifier_dottable, required: true
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
