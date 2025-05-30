# frozen_string_literal: true

module Api
  module V2
    class ExecutionEnvironmentsController < PulsibleApiController
      include ::Api::Version2

      before_action :find_resource, only: %i[update destroy]
      before_action :find_organization, only: %i[create]

      def index
        @execution_environments = resource_scope_for_index
      end

      def create
        permitted_params = execution_environment_params
        content = permitted_params.delete(:content)
        @execution_environment = ExecutionEnvironment.new(permitted_params)
        @execution_environment.organization = @organization

        begin
          ActiveRecord::Base.transaction do
            @execution_environment.save!
            associate_content_units(@execution_environment, content)
          end
        rescue ActiveRecord::RecordInvalid
          render_error('custom_error', status: :unprocessable_entity,
                       locals: { message: @execution_environment.flatten_errors })
        end
      end

      def update
        permitted_params = execution_environment_params
        content = permitted_params.delete(:content)

        begin
          ActiveRecord::Base.transaction do
            @execution_environment.update!(permitted_params)
            @execution_environment.execution_environment_content_units.clear
            associate_content_units(@execution_environment, content)
          end
        rescue ActiveRecord::RecordInvalid
          render_error('custom_error', status: :unprocessable_entity,
                       locals: { message: @execution_environment.flatten_errors })
        end
      end

      def destroy
        @execution_environment.destroy
      end

      private

      def execution_environment_params
        params.require(:execution_environment).permit(
          :name,
          :base_image_url,
          :ansible_version,
          content: %i[
            content_unit_type
            content_unit_id
            content_unit_version
          ]
        )
      end

      def associate_content_units(execution_env, content_array)
        content_array.each do |content|
          content_unit_type = content[:content_unit_type]
          content_unit_id = content[:content_unit_id]
          content_unit_version = content[:content_unit_version]

          unit = if content_unit_type == 'collection'
                   AnsibleCollection.find_by(id: content_unit_id)
                 else
                   AnsibleRole.find_by(id: content_unit_id)
                 end

          unless unit
            @execution_environment.errors.add(:id,
              "Content unit of type #{content_unit_type} with id #{content_unit_id} does not exist")
            raise ActiveRecord::RecordInvalid, @execution_environment
          end

          version_to_link = unit.content_unit_versions.where(version: content_unit_version).first

          unless version_to_link
            @execution_environment.errors.add(:content_unit_version,
              "#{unit.namespace}.#{unit.name} is not present in version #{content_unit_version}")
            raise ActiveRecord::RecordInvalid, @execution_environment
          end

          ExecutionEnvironmentContentUnit.find_or_create_by!(
            execution_environment: execution_env,
            content_unit: unit,
            content_unit_version: version_to_link
          )
        end
      end
    end
  end
end
