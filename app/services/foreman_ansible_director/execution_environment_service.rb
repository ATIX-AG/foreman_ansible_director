# frozen_string_literal: true

module ForemanAnsibleDirector
  class ExecutionEnvironmentService
    class << self
      def create_execution_environment(execution_environment_create)
        ActiveRecord::Base.transaction do
          env = ::ForemanAnsibleDirector::ExecutionEnvironment.create!(
            name: execution_environment_create[:name],
            base_image_url: execution_environment_create[:base_image_url],
            ansible_version: execution_environment_create[:ansible_version],
            organization_id: execution_environment_create[:organization_id]
          )
          env.update!(content_hash: env.generate_content_hash)
          env
        end
      end

      def edit_execution_environment(execution_environment_edit, execution_environment)
        ActiveRecord::Base.transaction do
          execution_environment.update!(
            name: execution_environment_edit[:name],
            base_image_url: execution_environment_edit[:base_image_url],
            ansible_version: execution_environment_edit[:ansible_version]
          )
          execution_environment.update!(content_hash: execution_environment.generate_content_hash)
          execution_environment
        end
      end

      def destroy_execution_environment(execution_environment)
        ActiveRecord::Base.transaction do
          execution_environment.destroy!
        end
      end

      def build_execution_environment(execution_environment)
        env_definition = {
          id: execution_environment.id,
          content: {
            base_image: execution_environment.base_image_url,
            ansible_core_version: execution_environment.ansible_version,
            content_units: execution_environment.content_unit_versions.map do |cuv|
              {
                type: cuv.versionable.type == 'ForemanAnsibleDirector::AnsibleCollection' ? 'collection' : 'role',
                identifier: cuv.versionable.full_name,
                version: cuv.version,
                source: "https://#{SETTINGS[:fqdn]}/pulp_ansible/galaxy/#{Organization.current.id}/#{cuv.versionable.full_name}",
              }
            end,
          },
        }

        if Rails.env.development?
          ForemanTasks.sync_task(
            ::ForemanAnsibleDirector::Actions::Proxy::BuildExecutionEnvironment,
            proxy_task_id: SecureRandom.uuid,
            execution_environment_definition: env_definition
          )
        else
          ForemanTasks.async_task(
            ::ForemanAnsibleDirector::Actions::Proxy::BuildExecutionEnvironment,
            proxy_task_id: SecureRandom.uuid,
            execution_environment_definition: env_definition
          )
        end
      end
    end
  end
end
