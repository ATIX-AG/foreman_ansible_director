# frozen_string_literal: true

module ForemanAnsibleDirector
  module Api
    module V2
      class LifecycleEnvironmentPathsController < AnsibleDirectorApiController
        include ::Api::Version2

        before_action :find_resource, only: %i[promote update destroy show]
        before_action :find_organization, only: %i[create]

        resource_description { resource_id 'AD Ansible Lifecycle Environment Paths' }

        # region ApiDoc: GET /api/v2/ansible_director/lifecycle_environments/paths
        api :GET, '/v2/ansible_director/lifecycle_environments/paths', N_('List lifecycle environment paths')
        param :organization_id, :number, desc: N_('Organization identifier.'), required: false
        param_group :search_and_pagination, ::Api::V2::BaseController
        # endregion
        def index
          @lifecycle_environment_paths = resource_scope_for_index
        end

        # region ApiDoc: GET /api/v2/ansible_director/lifecycle_environments/paths/:id
        api :GET, '/v2/ansible_director/lifecycle_environments/paths/:id',
          N_('Show details of a Lifecycle Environment Path')
        param :id, :number, desc: N_('Lifecycle Environment Path identifier.'), required: true
        # endregion
        def show
        end

        # region ApiDoc: POST /api/v2/ansible_director/lifecycle_environments/paths
        api :POST, '/v2/ansible_director/lifecycle_environments/paths', N_('Create a lifecycle environment path')
        param :organization_id, :number, desc: N_('Organization identifier.'), required: true
        param :lifecycle_environment_path, Hash, desc: N_('Lifecycle environment path definition'), required: true do
          param :name,
            String,
            desc: N_('Name of the lifecycle environment path.'),
            example: 'ALMA 9 Path',
            required: true
          param :description,
            String,
            desc: N_('Description of the lifecycle environment path.'),
            example: 'Path for AlmaLinux 9.',
            required: false
        end
        example <<~EXAMPLE
          {
            "organization_id": 1,
            "lifecycle_environment_path": {
              "name": "ALMA 9 Path",
              "description": "Path for AlmaLinux 9."
            }
          }
        EXAMPLE
        # endregion
        def create
          permitted_params = lifecycle_environment_path_params

          ::ForemanAnsibleDirector::LifecycleEnvironmentPathService.create_path(
            name: permitted_params[:name],
            description: permitted_params[:description],
            organization_id: @organization.id
          )
        end

        # region ApiDoc: PUT /api/v2/ansible_director/lifecycle_environments/paths/:id
        api :PUT, '/v2/ansible_director/lifecycle_environments/paths/:id', N_('Update a lifecycle environment path')
        param :lifecycle_environment_path, Hash, desc: N_('Lifecycle environment path definition'), required: true do
          param :name,
            String,
            desc: N_('Name of the lifecycle environment path.'),
            example: 'Prod Path Updated',
            required: false
          param :description,
            String,
            desc: N_('Description of the lifecycle environment path.'),
            example: 'Updated description',
            required: false
        end
        # TRANSLATORS: ApiDoc, do not translate!
        example <<~EXAMPLE
          {
            "lifecycle_environment_path": {
              "name": "ALMA 9 Path (Updated)",
              "description": "Path for AlmaLinux 9 (Updated)."
            }
          }
        EXAMPLE
        # endregion
        def update
          permitted_params = lifecycle_environment_path_params

          ::ForemanAnsibleDirector::LifecycleEnvironmentPathService.edit_path(
            lce_path: @lifecycle_environment_path,
            name: permitted_params[:name],
            description: permitted_params[:description]
          )
        end

        # region ApiDoc: DELETE /api/v2/ansible_director/lifecycle_environments/paths/:id
        api :DELETE, '/v2/ansible_director/lifecycle_environments/paths/:id',
          N_('Delete a lifecycle environment path')
        # endregion
        def destroy
          ::ForemanAnsibleDirector::LifecycleEnvironmentPathService.destroy_path(
            @lifecycle_environment_path
          )
        end

        # region ApiDoc: POST /api/v2/ansible_director/lifecycle_environment_paths/:id/promote
        api :POST, '/v2/ansible_director/lifecycle_environment_paths/:id/promote',
          N_('Promote content between environments in a lifecycle path')
        # TRANSLATORS: ApiDoc, do not translate!
        description <<~DESC
          Promote content between environments in a lifecycle path.
          If the 'ansible_director_lce_path_force_incremental' setting is false, 'target_environment' must be the immediate successor to 'source_environment'.
        DESC
        param :promote, Hash, desc: N_('Promotion parameters'), required: true do
          param :source_environment_id,
            :number,
            desc: N_('ID of the source lifecycle environment.'),
            example: 5,
            required: true
          param :target_environment_id,
            :number,
            desc: N_('ID of the target lifecycle environment.'),
            example: 6,
            required: true
        end
        # TRANSLATORS: ApiDoc, do not translate!
        example <<~EXAMPLE
          {
            "promote": {
              "source_environment_id": 3, # Library
              "target_environment_id": 4  # Dev
            }
          }
        EXAMPLE
        # endregion
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
