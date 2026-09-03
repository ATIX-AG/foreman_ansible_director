# frozen_string_literal: true

module ForemanAnsibleDirector
  class ExecutionEnvironmentService
    class << self
      def create_execution_environment(name:,
                                       base_image_url:,
                                       ansible_version:,
                                       organization_id:)
        # ActiveRecord::Base.transaction do
        env = ::ForemanAnsibleDirector::ExecutionEnvironment.create!(
          name: name,
          base_image_url: base_image_url,
          ansible_version: ansible_version,
          organization_id: organization_id,
          build_status: 'pending'
        )
        task = build_execution_environment env
        env.update!(content_hash: env.generate_content_hash, build_job: task.id)

        env
        # end
      end

      def edit_execution_environment(execution_environment:,
                                     name:,
                                     base_image_url:,
                                     ansible_version:)
        # TODO: Disabling this transaction as it locks up the task for an unknown reason
        # ActiveRecord::Base.transaction do
        execution_environment.update!(
          name: name,
          base_image_url: base_image_url,
          ansible_version: ansible_version
        )
        new_hash = execution_environment.generate_content_hash
        if new_hash != execution_environment.content_hash
          task = build_execution_environment execution_environment
          execution_environment.update!(content_hash: new_hash, build_job: task.id)
        end
        execution_environment
        # end
      end

      def destroy_execution_environment(execution_environment)
        ActiveRecord::Base.transaction do
          execution_environment.destroy!
        end
      end

      def build_execution_environment(execution_environment)
        proxy = ::SmartProxy.with_features(::ForemanAnsibleDirector::PROXY_FEATURE).first
        raise "No smart proxy with '#{::ForemanAnsibleDirector::PROXY_FEATURE}' feature found" unless proxy

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

        execution_environment.update!(build_status: 'running')

        ::ForemanAnsibleDirector::ActionService.trigger(
          ::ForemanAnsibleDirector::Actions::Proxy::BuildExecutionEnvironment,
          task_args: {
            proxy_task_id: SecureRandom.uuid,
            smart_proxy_id: proxy.id,
            execution_environment_definition: env_definition,
            execution_environment_id: execution_environment.id,
          },
          mode: :async
        )
      end
    end
  end
end
