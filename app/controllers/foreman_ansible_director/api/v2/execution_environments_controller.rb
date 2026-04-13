# frozen_string_literal: true

module ForemanAnsibleDirector
  module Api
    module V2
      class ExecutionEnvironmentsController < AnsibleDirectorApiController
        include ::Api::Version2

        before_action :find_resource, only: %i[update destroy]
        before_action :find_organization, only: %i[create]

        resource_description { resource_id 'AD Ansible Execution Environments' }

        # region ApiDoc: GET /api/v2/ansible_director/execution_environments
        api :GET, '/v2/ansible_director/execution_environments', N_('List all execution environments')
        param :organization_id, :number, desc: N_('Organization identifier.'), required: false
        param_group :search_and_pagination, ::Api::V2::BaseController
        # endregion
        def index
          @execution_environments = resource_scope_for_index
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
          param :base_image_url,
            String,
            desc: N_('Execution Environment base image URL. The image must be pullable by an unauthenticated user.'),
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
              "base_image_url": "quay.io/fedora/fedora:42",
              "ansible_version": "2.20.0"
            }
          }
        EXAMPLE
        # endregion
        def create
          permitted_params = execution_environment_params
          # content = permitted_params.delete(:content)

          ::ForemanAnsibleDirector::ExecutionEnvironmentService.create_execution_environment(
            name: permitted_params[:name],
            base_image_url: permitted_params[:base_image_url],
            ansible_version: permitted_params[:ansible_version],
            organization_id: @organization.id
          )
        end

        # region ApiDoc: PATCH /api/v2/ansible_director/execution_environments/:id
        api :PATCH, '/v2/ansible_director/execution_environments/:id', N_('Update an Execution Environment')
        param :execution_environment, Hash, desc: N_('Execution Environment definition'), required: true do
          param :name,
            String,
            desc: N_('Execution Environment name.'),
            example: 'MyExecutionEnvironment',
            required: false
          param :base_image_url,
            String,
            desc: N_('Execution Environment base image URL. The image must be pullable by an unauthenticated user.'),
            example: 'registry.fedoraproject.org/fedora:43',
            required: false
          # TRANSLATORS: ApiDoc, do not translate!
          param :ansible_version,
            String,
            desc: <<~DESC,
              Version of "ansible-core" to be used in this execution environment.
              The version must match one of the available releases.
              See: https://pypi.org/project/ansible-core/#history
            DESC
            example: ::ForemanAnsibleDirector::Constants::DEFAULT_ANSIBLE_VERSION,
            required: false
        end
        # TRANSLATORS: ApiDoc, do not translate!
        example <<~EXAMPLE
          {
            "execution_environment": {
              "name": "EE-2.20.0",
              "base_image_url": "quay.io/fedora/fedora:42",
              "ansible_version": "2.20.0"
            }
          }
        EXAMPLE
        # endregion
        def update
          permitted_params = execution_environment_params
          # content = permitted_params.delete(:content)

          ::ForemanAnsibleDirector::ExecutionEnvironmentService.edit_execution_environment(
            execution_environment: @execution_environment,
            name: permitted_params[:name],
            base_image_url: permitted_params[:base_image_url],
            ansible_version: permitted_params[:ansible_version]
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

        private

        def execution_environment_params
          params.require(:execution_environment).permit(
            :name,
            :base_image_url,
            :ansible_version
            # content: %i[
            #  id
            #  version
            # ]
          )
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
