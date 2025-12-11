# frozen_string_literal: true

module ForemanAnsibleDirector
  module Api
    module V2
      class ExecutionEnvironmentsController < AnsibleDirectorApiController
        include ::Api::Version2

        before_action :find_resource, only: %i[update destroy]
        before_action :find_organization, only: %i[create]

        def index
          @execution_environments = resource_scope_for_index
        end

        def create
          permitted_params = execution_environment_params
          # content = permitted_params.delete(:content)

          ee_create = ::ForemanAnsibleDirector::Structs::ExecutionEnvironment::ExecutionEvironmentCreate.new(
            permitted_params[:name],
            permitted_params[:base_image_url],
            permitted_params[:ansible_version],
            @organization.id
          )
          ::ForemanAnsibleDirector::ExecutionEnvironmentService.create_execution_environment ee_create
        end

        def update
          permitted_params = execution_environment_params
          # content = permitted_params.delete(:content)

          ee_update = ::Structs::ExecutionEnvironment::ExecutionEnvironmentEdit.new(
            permitted_params[:name],
            permitted_params[:base_image_url],
            permitted_params[:ansible_version],
            @organization.id
          )

          ::ForemanAnsibleDirector::ExecutionEnvironmentService.edit_execution_environment ee_update,
            @execution_environment
        end

        def destroy
          @execution_environment.destroy
          ::ForemanAnsibleDirector::ExecutionEnvironmentService.destroy_execution_environment @execution_environment
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
