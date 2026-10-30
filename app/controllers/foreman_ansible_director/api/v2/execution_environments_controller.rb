# frozen_string_literal: true

module ForemanAnsibleDirector
  module Api
    module V2
      class ExecutionEnvironmentsController < AnsibleDirectorApiController
        include ::Api::Version2

        # rubocop:disable Rails/LexicallyScopedActionFilter
        before_action :find_optional_organization, only: %i[index auto_complete_search]
        # rubocop:enable Rails/LexicallyScopedActionFilter
        before_action :find_resource, only: %i[show update_full update_partial destroy]
        before_action :find_organization, only: %i[create import]

        resource_description { resource_id 'AD Ansible Execution Environments' }

        # region ApiDoc: GET /api/v2/ansible_director/execution_environments
        api :GET, '/v2/ansible_director/execution_environments', N_('List all execution environments')
        param :organization_id, :number, desc: N_('Organization identifier.'), required: false
        param_group :search_and_pagination, ::Api::V2::BaseController
        add_scoped_search_description_for(::ForemanAnsibleDirector::ExecutionEnvironment)
        # endregion
        def index
          @execution_environments = resource_scope_for_index
        end

        # region ApiDoc: GET /api/v2/ansible_director/execution_environments/:id
        api :GET, '/v2/ansible_director/execution_environments/:id', N_('Show details of an execution environment')
        param :id, :number, desc: N_('Execution Environment identifier.'), required: true
        # endregion
        def show
        end

        # region ApiDoc: POST /api/v2/ansible_director/execution_environments
        api :POST, '/v2/ansible_director/execution_environments', N_('Create an Execution Environment')
        param :organization_id, :number, desc: N_('Organization identifier'), required: true
        param :execution_environment, Hash, desc: N_('Execution Environment definition'), required: true do
          param :name,
            String,
            desc: N_('Execution Environment name.'),
            example: 'MyExecutionEnvironment',
            required: true
          param :container_image_url,
            String,
            desc: <<~DESC,
              Execution Environment container image URL.
              The container image must be pullable by an unauthenticated user.
            DESC
            example: 'registry.fedoraproject.org/fedora:43',
            required: true
          # TRANSLATORS: ApiDoc, do not translate!
          param :ansible_version,
            String,
            desc: <<~DESC,
              Version of "ansible-core" to be used in this execution environment.
              The version must match one of the available releases.
              See: https://pypi.org/project/ansible-core/#history
            DESC
            example: ::ForemanAnsibleDirector::Constants::DEFAULT_ANSIBLE_VERSION,
            required: true
        end
        # TRANSLATORS: ApiDoc, do not translate!
        example <<~EXAMPLE
          {
            "organization_id": 1,
            "execution_environment": {
              "name": "EE-2.20.0",
              "container_image_url": "quay.io/fedora/fedora:42",
              "ansible_version": "2.20.0"
            }
          }
        EXAMPLE
        # endregion
        def create
          permitted_params = execution_environment_build_params
          # content = permitted_params.delete(:content)

          ::ForemanAnsibleDirector::ExecutionEnvironmentService.create_execution_environment(
            name: permitted_params[:name],
            container_image_url: permitted_params[:container_image_url],
            ansible_version: permitted_params[:ansible_version],
            organization_id: @organization.id
          )
        end

        # region ApiDoc: POST /api/v2/ansible_director/execution_environments/import
        api :POST, '/v2/ansible_director/execution_environments/import', N_('Import an existing Execution Environment')
        param :organization_id, :number, desc: N_('Organization identifier'), required: true
        param :execution_environment, Hash, desc: N_('Execution Environment definition'), required: true do
          param :name,
            String,
            desc: N_('Execution Environment name.'),
            example: 'MyExecutionEnvironment',
            required: true
          param :container_image_url,
            String,
            desc: <<~DESC,
              Fully-qualified container registry path where the Execution Environment image is located.
              The URL must contain a scheme and an image tag.
            DESC
            example: 'https://ghcr.io/ansible-community/community-ee-base:latest',
            required: true
        end
        # TRANSLATORS: ApiDoc, do not translate!
        example <<~EXAMPLE
          {
            "organization_id": 1,
            "execution_environment": {
              "name": "Ansible Community-EE",
              "container_image_url": "https://ghcr.io/ansible-community/community-ee-base:latest",
            }
          }
        EXAMPLE
        # endregion
        def import
          permitted_params = execution_environment_import_params

          ::ForemanAnsibleDirector::ExecutionEnvironmentService.import_execution_environment(
            name: permitted_params[:name],
            container_image_url: permitted_params[:container_image_url],
            verify_ssl: permitted_params[:verify_ssl],
            organization_id: @organization.id
          )
        end

        # region ApiDoc: PUT /api/v2/ansible_director/execution_environments/:id
        api :PUT, '/v2/ansible_director/execution_environments/:id', N_('Update an Execution Environment')
        param :execution_environment, Hash, desc: N_('Execution Environment definition'), required: true do
          param :name,
            String,
            desc: N_('Execution Environment name.'),
            example: 'MyExecutionEnvironment',
            required: true
          param :container_image_url,
            String,
            # The argument below is ignored for two reasons (for both PUT and PATCH):
            #   1. I want to keep the API contract consistent. A user may not immediately know whether an
            #      Execution Environment has been built or imported
            #   2. ApiPie does not support conditional parameters.
            #      Refs: https://github.com/Apipie/apipie-rails/issues/550
            desc: <<~DESC,
              Fully-qualified container registry path where the Execution Environment image is located.
              The URL must contain a scheme and an image tag.
              This argument is ignored for imported Execution Environments.
            DESC
            example: 'registry.fedoraproject.org/fedora:43',
            required: true
          # TRANSLATORS: ApiDoc, do not translate!
          param :ansible_version,
            String,
            desc: <<~DESC,
              Version of "ansible-core" to be used in this execution environment.
              The version must match one of the available releases.
              See: https://pypi.org/project/ansible-core/#history
              This argument is ignored for imported Execution Environments.
            DESC
            example: ::ForemanAnsibleDirector::Constants::DEFAULT_ANSIBLE_VERSION,
            required: true
        end
        # TRANSLATORS: ApiDoc, do not translate!
        example <<~EXAMPLE
          {
            "execution_environment": {
              "name": "EE-2.20.0",
              "container_image_url": "quay.io/fedora/fedora:42",
              "ansible_version": "2.20.0"
            }
          }
        EXAMPLE
        # endregion
        def update_full
          execution_environment_params = execution_environment_full_params(variant: @execution_environment.source)

          ::ForemanAnsibleDirector::ExecutionEnvironmentService.edit_execution_environment(
            execution_environment: @execution_environment,
            **execution_environment_params
          )
        end

        # region ApiDoc: PATCH /api/v2/ansible_director/execution_environments/:id
        api :PATCH, '/v2/ansible_director/execution_environments/:id', N_('Partially update an Execution Environment')
        param :execution_environment, Hash, desc: N_('Execution Environment definition'), required: true do
          param :name,
            String,
            desc: N_('Execution Environment name.'),
            example: 'MyExecutionEnvironment',
            required: false
          param :container_image_url,
            String,
            desc: <<~DESC,
              Execution Environment container image URL.
              The container image must be pullable by an unauthenticated user.
              This argument is ignored for imported Execution Environments.
            DESC
            example: 'registry.fedoraproject.org/fedora:43',
            required: false
          # TRANSLATORS: ApiDoc, do not translate!
          param :ansible_version,
            String,
            desc: <<~DESC,
              Version of "ansible-core" to be used in this execution environment.
              The version must match one of the available releases.
              See: https://pypi.org/project/ansible-core/#history
              This argument is ignored for imported Execution Environments.
            DESC
            example: ::ForemanAnsibleDirector::Constants::DEFAULT_ANSIBLE_VERSION,
            required: false
        end
        # TRANSLATORS: ApiDoc, do not translate!
        example <<~EXAMPLE
          {
            "execution_environment": {
              "name": "EE-2.20.0",
            }
          }
        EXAMPLE
        # endregion
        def update_partial
          execution_environment_params = execution_environment_partial_params(variant: @execution_environment.source)

          ::ForemanAnsibleDirector::ExecutionEnvironmentService.edit_execution_environment(
            execution_environment: @execution_environment,
            **execution_environment_params
          )
        end

        # region ApiDoc: DELETE /api/v2/ansible_director/execution_environments/:id
        api :DELETE, '/v2/ansible_director/execution_environments/:id', N_('Delete an Execution Environment')
        # endregion
        def destroy
          @execution_environment.destroy
          ::ForemanAnsibleDirector::ExecutionEnvironmentService.destroy_execution_environment @execution_environment
        end

        def model_of_controller
          resource_class
        end

        def resource_scope
          organization_scoped_resource_scope
        end

        private

        def base_params
          params.require(:execution_environment).permit(
            :name,
            :container_image_url,
            :ansible_version,
            :verify_ssl
          )
        end

        def execution_environment_build_params
          root_node = base_params
          {
            name: root_node.require(:name),
            container_image_url: root_node.require(:container_image_url),
            ansible_version: root_node.require(:ansible_version),
          }
        end

        def execution_environment_import_params
          root_node = base_params
          name = root_node.require(:name)
          container_image_url = root_node.require(:container_image_url)
          verify_ssl = params[:verify_ssl]
          {
            name: name,
            container_image_url: container_image_url,
            verify_ssl: verify_ssl || Setting[:ansible_director_ee_import_verify_ssl],
          }
        end

        def execution_environment_partial_params(variant:)
          root_node = base_params
          if variant == 'image_build'
            {
              name: root_node[:name],
              ansible_version: root_node[:ansible_version],
              container_image_url: root_node[:container_image_url],
            }
          else
            {
              name: root_node[:name],
            }
          end
        end

        def execution_environment_full_params(variant:)
          root_node = base_params

          if variant == 'image_build'
            {
              name: root_node.require(:name),
              ansible_version: root_node.require(:ansible_version),
              container_image_url: root_node.require(:container_image_url),
            }
          else
            {
              name: root_node.require(:name),
            }
          end
        end

        # def associate_content_units(execution_env, content_array) TODO: OR-6580
        #  content_array.each do |content|
        #    content_unit_id = content[:id]
        #    content_unit_version = content[:version]
        #
        #    unit = ContentUnit.find_by(id: content_unit_id)
        #
        #    unless unit
        #      @execution_environment.errors.add(:id,
        #        "Content with id #{content_unit_id} does not exist")
        #      raise ActiveRecord::RecordInvalid, @execution_environment
        #    end
        #
        #    version_to_link = unit.content_unit_versions.where(version: content_unit_version).first
        #
        #    unless version_to_link
        #      @execution_environment.errors.add(:content_unit_version,
        #        "#{unit.namespace}.#{unit.name} is not present in version #{content_unit_version}")
        #      raise ActiveRecord::RecordInvalid, @execution_environment
        #    end
        #
        #    ExecutionEnvironmentContentUnit.find_or_create_by!(
        #      execution_environment: execution_env,
        #      content_unit: unit,
        #      content_unit_version: version_to_link
        #    )
        #  end
        # end

        def resource_class
          ::ForemanAnsibleDirector::ExecutionEnvironment
        end
      end
    end
  end
end
