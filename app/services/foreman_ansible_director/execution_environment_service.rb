# frozen_string_literal: true

module ForemanAnsibleDirector
  class ExecutionEnvironmentService < ::ForemanAnsibleDirector::AnsibleDirectorService
    class << self
      def create_execution_environment(name:,
                                       container_image_url:,
                                       ansible_version:,
                                       organization_id:)
        # ActiveRecord::Base.transaction do
        env = ::ForemanAnsibleDirector::ExecutionEnvironment.create!(
          name: name,
          container_image_url: container_image_url,
          source: 'image_build',
          ansible_version: ansible_version,
          organization_id: organization_id,
          status: 'pending'
        )
        task = build_execution_environment env
        env.update!(content_hash: env.generate_content_hash, latest_task_id: task.id)

        env
        # end
      end

      def import_execution_environment(name:,
                                       container_image_url:,
                                       verify_ssl:,
                                       organization_id:)

        container_image_url_components = verify_pull_url!(container_image_url: container_image_url)
        env = ActiveRecord::Base.transaction do
          ::ForemanAnsibleDirector::ExecutionEnvironment.create!(
            name: name,
            source: 'image_import',
            container_image_url: container_image_url,
            organization_id: organization_id,
            status: 'running'
          )
        end

        task = clone_execution_environment_image(
          execution_environment: env,
          container_image_url_components: container_image_url_components,
          verify_ssl: verify_ssl
        )
        env.update!(latest_task_id: task.id)
        env
      end

      def edit_execution_environment(execution_environment:,
                                     **args)
        # TODO: Disabling this transaction as it locks up the task for an unknown reason
        # ActiveRecord::Base.transaction do
        execution_environment.update!(
          args
        )
        new_hash = execution_environment.generate_content_hash
        if new_hash != execution_environment.content_hash
          task = build_execution_environment execution_environment
          execution_environment.update!(content_hash: new_hash, latest_task_id: task.id)
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
        staging_product = find_staging_product!(execution_environment: execution_environment)

        selector = ::ForemanAnsibleDirector::AnsibleDirectorBuildProxySelector.new
        build_proxy = selector.determine_proxy(
          execution_environment_org_id: execution_environment.organization_id
        )

        unless build_proxy
          execution_environment.update!(status: 'failed')
          ctx.add_error(::ForemanAnsibleDirector::Issues::Errors::NoProxyForBuild.new, critical: true)
        end

        env_definition = {
          id: execution_environment.id,
          content: {
            base_image: execution_environment.container_image_url,
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

        execution_environment.update!(status: 'running')

        ::ForemanAnsibleDirector::ActionService.trigger(
          ::ForemanAnsibleDirector::Actions::ExecutionEnvironment::Build,
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

      def clone_execution_environment_image(execution_environment:,
                                            container_image_url_components:,
                                            verify_ssl:)

        staging_product = find_staging_product!(execution_environment: execution_environment)

        opts = katello_repository_options(
          execution_environment: execution_environment,
          staging_product_id: staging_product.id,
          container_image_url_components: container_image_url_components,
          verify_ssl: verify_ssl
        )

        ::ForemanAnsibleDirector::ActionService.trigger(
          ::ForemanAnsibleDirector::Actions::ExecutionEnvironment::Import,
          task_args: {
            execution_environment_id: execution_environment.id,
            katello_repository_options: opts,
          }
        )
      end

      private

      def verify_pull_url!(container_image_url:)
        url = URI.parse(container_image_url)

        unless %w[http https].include?(url.scheme)
          ctx.add_error(::ForemanAnsibleDirector::Issues::Errors::InvalidRegistryURL.new(
            container_image_url: container_image_url
          ), critical: true)
        end

        path = url.path || ''
        last_segment = path.rpartition('/').last

        unless last_segment.include?(':')
          ctx.add_error(::ForemanAnsibleDirector::Issues::Errors::InvalidRegistryURL.new(
            container_image_url: container_image_url
          ), critical: true)
        end

        tag = last_segment.rpartition(':').last

        if tag.empty?
          ctx.add_error(::ForemanAnsibleDirector::Issues::Errors::InvalidRegistryURL.new(
            container_image_url: container_image_url
          ), critical: true)
        end

        repository = path.sub(/:#{tag}\z/, '')
        repo_segments = repository.split('/').compact

        if repo_segments.empty?
          ctx.add_error(::ForemanAnsibleDirector::Issues::Errors::InvalidRegistryURL.new(
            container_image_url: container_image_url
          ), critical: true)
        end

        # The URI module is too smart and returns the default port for the protocol. I.e. HTTPS: 443, SSH: 22, ...
        base = if url.port && url.port != url.default_port
                 "#{url.scheme}://#{url.host}:#{url.port}/"
               else
                 "#{url.scheme}://#{url.host}/"
               end

        {
          base: base,
          # The path always begins with a /
          repository: repository[1..],
          tag: tag,
        }
      rescue ::URI::InvalidURIError
        ctx.add_error(::ForemanAnsibleDirector::Issues::Errors::InvalidRegistryURL.new(
          container_image_url: container_image_url
        ), critical: true)
      end

      def find_staging_product!(execution_environment:)
        staging_product = ::Katello::Product.find_by(
          organization_id: execution_environment.organization_id,
          name: ::ForemanAnsibleDirector::Constants::EE_STAGING_PRODUCT_NAME
        )

        unless staging_product
          ctx.add_error(::ForemanAnsibleDirector::Issues::Errors::StagingProductMissing.new(
            execution_environment: execution_environment
          ), critical: true)
        end
        staging_product
      end

      def katello_repository_options(execution_environment:,
                                     staging_product_id:,
                                     container_image_url_components:,
                                     verify_ssl:)
        ActiveSupport::HashWithIndifferentAccess.new(
          {
            name: "#{::ForemanAnsibleDirector::Constants::EE_IMAGE_BASENAME}_#{execution_environment.id}",
            label: "#{::ForemanAnsibleDirector::Constants::EE_IMAGE_BASENAME}_#{execution_environment.id}",
            download_policy: 'immediate',
            content_type: ::Katello::Repository::DOCKER_TYPE,
            unprotected: true,
            product_id: staging_product_id,
            url: container_image_url_components[:base],
            docker_upstream_name: container_image_url_components[:repository],
            include_tags: [container_image_url_components[:tag]],
            mirroring_policy: 'mirror_content_only',
            verify_ssl_on_sync: verify_ssl,
          }
        )
      end
    end
  end
end
