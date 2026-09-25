# frozen_string_literal: true

module ForemanAnsibleDirector
  class ExecutionEnvironmentService < ::ForemanAnsibleDirector::AnsibleDirectorService
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
        staging_product = ::Katello::Product.find_by(
          organization_id: execution_environment.organization_id,
          name: ::ForemanAnsibleDirector::Constants::EE_STAGING_PRODUCT_NAME
        )
        if staging_product
          image_base_path = "id/#{execution_environment.organization_id}/#{staging_product.id}"
          image_name = "#{::ForemanAnsibleDirector::Constants::EE_IMAGE_BASENAME}_#{execution_environment.id}"
          image_path = "#{image_base_path}/#{image_name}"

          environment_repo = staging_product.repositories.find_by(container_repository_name: image_path)
          if environment_repo
            ::ForemanTasks.async_task(
              ::Actions::Katello::Repository::Destroy, environment_repo
            )
          end
        end

        ActiveRecord::Base.transaction do
          execution_environment.destroy!
        end
      end

      def build_execution_environment(execution_environment)
        staging_product = ::Katello::Product.find_by(
          organization_id: execution_environment.organization_id,
          name: ::ForemanAnsibleDirector::Constants::EE_STAGING_PRODUCT_NAME
        )

        unless staging_product
          ctx.add_error(::ForemanAnsibleDirector::Issues::Errors::StagingProductMissing.new(
            execution_environment: execution_environment
          ), critical: true)
        end

        selector = ::ForemanAnsibleDirector::AnsibleDirectorBuildProxySelector.new
        build_proxy = selector.determine_proxy(
          execution_environment_org_id: execution_environment.organization_id
        )

        unless build_proxy
          execution_environment.update!(build_status: 'failed')
          ctx.add_error(::ForemanAnsibleDirector::Issues::Errors::NoProxyForBuild.new, critical: true)
        end

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

        registry_base_url = "#{SETTINGS[:fqdn]}/id/#{execution_environment.organization_id}/#{staging_product.id}"
        image_name = "#{::ForemanAnsibleDirector::Constants::EE_IMAGE_BASENAME}_#{execution_environment.id}:latest"

        push_url = "#{registry_base_url}/#{image_name}"

        execution_environment.update!(build_status: 'running')

        ::ForemanAnsibleDirector::ActionService.trigger(
          ::ForemanAnsibleDirector::Actions::Proxy::BuildExecutionEnvironment,
          task_args: {
            proxy_id: build_proxy.id,
            proxy_task_id: SecureRandom.uuid,
            execution_environment_definition: env_definition,
            execution_environment_id: execution_environment.id,
            push_url: push_url,
          },
          mode: :async
        )
      end
    end
  end
end
