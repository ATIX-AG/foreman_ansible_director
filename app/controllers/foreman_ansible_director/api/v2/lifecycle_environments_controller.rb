# frozen_string_literal: true

module ForemanAnsibleDirector
  module Api
    module V2
      class LifecycleEnvironmentsController < AnsibleDirectorApiController
        include ::Api::Version2

        before_action :find_resource, only: %i[show update_full update_partial destroy]
        before_action :find_path, only: %i[create]
        before_action :find_organization, only: %i[create]

        resource_description { resource_id 'AD Ansible Lifecycle Environments' }

        # region ApiDoc: GET /api/v2/ansible_director/lifecycle_environments/:id
        api :GET, '/v2/ansible_director/lifecycle_environments/:id', N_('Show details of a lifecycle environment')
        # endregion
        def show
        end

        # region ApiDoc: POST /api/v2/ansible_director/lifecycle_environments
        api :POST, '/v2/ansible_director/lifecycle_environments', N_('Create a lifecycle environment')
        param :organization_id, :number, desc: N_('Organization identifier.'), required: true
        param :lifecycle_environment_path_id, :number,
          desc: N_('ID of the lifecycle environment path to attach this environment to.'), required: true
        param :lifecycle_environment, Hash, desc: N_('Lifecycle environment definition'), required: true do
          param :name,
            String,
            desc: N_('Name of the lifecycle environment.'),
            example: 'Dev',
            required: true
          param :description,
            String,
            desc: N_('Description of the lifecycle environment.'),
            example: 'Development environment',
            required: false
          param :position,
            :number,
            desc: N_('Position in the path (0 = first, -1 = last). Defaults to 0 if omitted.'),
            example: 1,
            required: false
        end
        # TRANSLATORS: ApiDoc, do not translate!
        example <<~EXAMPLE
          {
            "organization_id": 1,
            "lifecycle_environment_path_id": 2,
            "lifecycle_environment": {
              "name": "Staging",
              "description": "Staging environment for QA testing",
              "position": 2
            }
          }
        EXAMPLE
        # endregion
        def create
          permitted_params = lifecycle_environment_params
          position = permitted_params.delete(:position) || 0

          ::ForemanAnsibleDirector::LifecycleEnvironmentService.create_environment(
            lce_path: @lifecycle_environment_path,
            name: permitted_params[:name],
            description: permitted_params[:description],
            position: position,
            organization_id: @organization.id
          )
        end

        # region ApiDoc: PUT /api/v2/ansible_director/lifecycle_environments/:id
        api :PUT, '/v2/ansible_director/lifecycle_environments/:id',
          N_('Update an Ansible lifecycle environment')
        param :lifecycle_environment, Hash, desc: N_('Lifecycle environment updates'), required: true do
          param :name,
            String,
            desc: N_('New name for the lifecycle environment.'),
            example: 'Prod',
            required: true
          param :description,
            String,
            desc: N_('Description of the lifecycle environment.'),
            example: 'Development environment',
            required: true
          param :execution_environment_id,
            :number,
            desc: N_('ID of the execution environment to associate with this lifecycle environment.'),
            example: 3,
            required: true
          param :content_unit_version_ids,
            Array,
            of: Integer,
            desc: N_('Array of content unit version IDs'),
            required: true
        end
        # TRANSLATORS: ApiDoc, do not translate!
        example <<~EXAMPLE
          {
            "lifecycle_environment": {
              "name": "Production",
              "execution_environment_id": 5,
              "content_unit_version_ids": [ 1, 2, 3 ]
            }
          }
        EXAMPLE
        # endregion
        def update_full
          permitted_params = lce_full_params(mutable: @lifecycle_environment.root?)

          ::ForemanAnsibleDirector::LifecycleEnvironmentService.edit_environment(
            environment: @lifecycle_environment,
            **permitted_params
          )
        end

        # region ApiDoc: PATCH /api/v2/ansible_director/lifecycle_environments/:id
        api :PATCH, '/v2/ansible_director/lifecycle_environments/:id',
          N_('Partially update a lifecycle environment\'s basic information')
        param :lifecycle_environment, Hash, desc: N_('Lifecycle environment updates'), required: true do
          param :name,
            String,
            desc: N_('New name for the lifecycle environment.'),
            example: 'Prod',
            required: false
          param :description,
            String,
            desc: N_('New description for the lifecycle environment.'),
            example: 'Production environment',
            required: false
          param :execution_environment_id,
            :number,
            desc: N_('ID of the execution environment to associate with this lifecycle environment.'),
            example: 3,
            required: false
          param :content_unit_version_ids,
            Array,
            of: Integer,
            desc: N_('Array of content unit version IDs'),
            required: false
        end
        # TRANSLATORS: ApiDoc, do not translate!
        example <<~EXAMPLE
          {
            "lifecycle_environment": {
              "content_unit_version_ids": [ 1, 2, 3 ]
            }
          }
        EXAMPLE
        # endregion
        def update_partial
          permitted_params = lce_partial_params(mutable: @lifecycle_environment.root?)

          ::ForemanAnsibleDirector::LifecycleEnvironmentService.edit_environment(
            environment: @lifecycle_environment,
            **permitted_params
          )
        end

        # region ApiDoc: DELETE /api/v2/ansible_director/lifecycle_environments/:id
        api :DELETE, '/v2/ansible_director/lifecycle_environments/:id', N_('Delete a lifecycle environment')
        # endregion
        def destroy
          ::ForemanAnsibleDirector::LifecycleEnvironmentService.destroy_environment @lifecycle_environment
        end

        def model_of_controller
          resource_class
        end

        def resource_scope
          ::ForemanAnsibleDirector::LifecycleEnvironment.all
        end

        private

        def base_params
          params.require(:lifecycle_environment).permit(
            :name,
            :description,
            :execution_environment_id,
            content_unit_version_ids: []
          )
        end

        def lce_full_params(mutable:)
          root_node = base_params

          if mutable
            {
              name: root_node.require(:name),
              execution_environment_id: root_node.require(:execution_environment_id),
              content_unit_version_ids: root_node.require(:content_unit_version_ids),
              description: root_node.require(:description),
            }
          else
            {
              name: root_node.require(:name),
              description: root_node.require(:description),
            }
          end
        end

        def lce_partial_params(mutable:)
          root_node = base_params

          if mutable
            {
              name: root_node[:name],
              execution_environment_id: root_node[:execution_environment_id],
              content_unit_version_ids: root_node[:content_unit_version_ids],
              description: root_node[:description],
            }.compact
          else
            {
              name: root_node[:name],
              description: root_node[:description],
            }.compact
          end
        end

        def lifecycle_environment_params
          params.require(:lifecycle_environment).permit(
            :name,
            :description,
            :position
            # content: [
            #  :execution_environment_id,
            #  { content_unit_version_ids: %i[id version] },
            # ]
          ).merge(
            # lifecycle_environment_path_id: params[:lifecycle_environment_path_id],
            organization_id: params[:organization_id]
          )
        end

        def find_path
          @lifecycle_environment_path = ::ForemanAnsibleDirector::LifecycleEnvironmentPath.find(
            params[:lifecycle_environment_path_id]
          )
        end

        def resource_class
          ::ForemanAnsibleDirector::LifecycleEnvironment
        end
      end
    end
  end
end
