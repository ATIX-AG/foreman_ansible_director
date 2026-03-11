# frozen_string_literal: true

module ForemanAnsibleDirector
  module Api
    module V2
      class ExecutionEnvironmentsController < AnsibleDirectorApiController
        include ::Api::Version2

        before_action :find_resource, only: %i[update destroy]
        before_action :find_organization, only: %i[create]

        resource_description do
          resource_id 'execution_environments'
          api_version 'v2'
          api_base_url '/ansible_director'
          param :organization_id, Integer, show: false
        end

        api :GET, '/execution_environments/', N_('List execution environments')
        param_group :search_and_pagination, ::Api::V2::BaseController
        add_scoped_search_description_for(::ForemanAnsibleDirector::ExecutionEnvironment)

        def index
          @execution_environments = resource_scope_for_index
        end

        api :POST, '/execution_environments/', N_('Create execution environment')
        param :organization_id, Integer, required: true
        param :execution_environment, Hash, required: true do
          param :name, String, required: true
          param :base_image_url, String, required: true
          param :ansible_version, String, required: true
        end

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

        api :PATCH, '/execution_environments/:id', N_('Update execution environment')
        param :id, :identifier_dottable, required: true
        param :execution_environment, Hash, required: true do
          param :name, String, required: false
          param :base_image_url, String, required: false
          param :ansible_version, String, required: false
        end

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

        api :DELETE, '/execution_environments/:id', N_('Delete execution environment')
        param :id, :identifier_dottable, required: true

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
