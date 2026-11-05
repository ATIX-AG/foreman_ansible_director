require 'foreman_ansible_director_test_helper'

module ForemanAnsibleDirectorTests
  module Services
    module Unit
      class ExecutionEnvironmentServiceTest < ForemanAnsibleDirectorTestCase

        setup do
          as_admin do
            provider = FactoryBot.create(:katello_provider, organization: @organization)
            @staging_product = FactoryBot.create(
              :katello_product,
              :organization => @organization,
              :name => ::ForemanAnsibleDirector::Constants::EE_STAGING_PRODUCT_NAME,
              :provider => provider,
              :cp_id => '12345',
              )

            @build_proxy = FactoryBot.create(
              :smart_proxy,
              :ansible_director,
              organizations: [@organization],
              container_registry_auth_enabled: true
            )
          end
          ::ForemanAnsibleDirector::AnsibleDirectorBuildProxySelector.any_instance.stubs(:determine_proxy).returns(@build_proxy)
        end

        describe '#create_execution_environment' do
          test 'creates an execution environment with valid params' do

            ee = ::ForemanAnsibleDirector::ExecutionEnvironmentService.create_execution_environment(
              name: "test_ee",
              container_image_url: "quay.io/ansible/base-ee:latest",
              ansible_version: "2.20.0",
              organization_id: @organization.id
            )

            assert_not_nil ee
            assert_equal 'test_ee', ee.name
            assert_equal 'quay.io/ansible/base-ee:latest', ee.container_image_url
            assert_equal '2.20.0', ee.ansible_version
          end

          test 'triggers execution environment build' do

            fake_task = Struct.new(:id).new(1234)
            task_called = false
            action_name = nil
            env_def = nil

            ForemanTasks.stub(:async_task, ->(action, **args) { task_called = true
            action_name = action.name
            env_def = args[:execution_environment_definition]
            return fake_task
            }) do
              ::ForemanAnsibleDirector::ExecutionEnvironmentService.create_execution_environment(
                name: "test_ee",
                container_image_url: "quay.io/ansible/base-ee:latest",
                ansible_version: "2.20.0",
                organization_id: @organization.id
              )
            end

            assert task_called
            assert_equal "ForemanAnsibleDirector::Actions::ExecutionEnvironment::Build", action_name
            assert_not_nil env_def
          end

          test 'creates execution environment within transaction' do

            initial_count = ::ForemanAnsibleDirector::ExecutionEnvironment.count

            assert_raises(ActiveRecord::RecordInvalid) do
              ::ForemanAnsibleDirector::ExecutionEnvironmentService.create_execution_environment(
                name: nil,
                container_image_url: "quay.io/ansible/base-ee:latest",
                ansible_version: "2.20.0",
                organization_id: @organization.id
              )
            end

            assert_equal initial_count, ::ForemanAnsibleDirector::ExecutionEnvironment.count
          end
        end

        describe '#edit_execution_environment' do
          setup do
            @execution_environment = FactoryBot.create(:execution_environment, organization: @organization)
          end

          test 'updates execution environment with valid params' do

            ::ForemanAnsibleDirector::ExecutionEnvironmentService.edit_execution_environment(
              execution_environment: @execution_environment,
              name: "updated_ee",
              container_image_url: "quay.io/ansible/updated-ee:latest",
              ansible_version: "2.19.0"
            )
            @execution_environment.reload

            assert_equal 'updated_ee', @execution_environment.name
            assert_equal 'quay.io/ansible/updated-ee:latest', @execution_environment.container_image_url
            assert_equal '2.19.0', @execution_environment.ansible_version
          end

          test 'triggers execution environment build on hash change' do

            fake_task = Struct.new(:id).new(1234)
            task_called = false
            action_name = nil
            env_def = nil

            ForemanTasks.stub(:async_task, ->(action, **args) { task_called = true
            action_name = action.name
            env_def = args[:execution_environment_definition]
            return fake_task
            }) do
              ::ForemanAnsibleDirector::ExecutionEnvironmentService.edit_execution_environment(
                execution_environment: @execution_environment,
                name: "edited_name",
                container_image_url: @execution_environment.container_image_url,
                ansible_version: @execution_environment.ansible_version
              )
            end

            @execution_environment.reload

            assert_not task_called
            assert_nil action_name
            assert_nil env_def

            ForemanTasks.stub(:async_task, ->(action, **args) { task_called = true
            action_name = action.name
            env_def = args[:execution_environment_definition]
            return fake_task
            }) do
              ::ForemanAnsibleDirector::ExecutionEnvironmentService.edit_execution_environment(
                execution_environment: @execution_environment,
                name: @execution_environment.name,
                container_image_url: "quay.io/fedora/fedora:42",
                ansible_version: @execution_environment.ansible_version
              )
            end

            assert task_called
            assert_equal "ForemanAnsibleDirector::Actions::ExecutionEnvironment::Build", action_name
            assert_not_nil env_def

            task_called = false
            action_name = nil
            env_def = nil

            ForemanTasks.stub(:async_task, ->(action, **args) { task_called = true
            action_name = action.name
            env_def = args[:execution_environment_definition]
            return fake_task
            }) do
              ::ForemanAnsibleDirector::ExecutionEnvironmentService.edit_execution_environment(
                execution_environment: @execution_environment,
                name: @execution_environment.name,
                container_image_url: @execution_environment.container_image_url,
                ansible_version: "2.19.3"
              )
            end

            assert task_called
            assert_equal "ForemanAnsibleDirector::Actions::ExecutionEnvironment::Build", action_name
            assert_not_nil env_def

          end

          test 'updates execution environment within transaction' do
            original_name = @execution_environment.name

            assert_raises(ActiveRecord::RecordInvalid) do
              ::ForemanAnsibleDirector::ExecutionEnvironmentService.edit_execution_environment(
                execution_environment: @execution_environment,
                name: nil,
                container_image_url: 'quay.io/ansible/base-ee:latest',
                ansible_version: '2.19.0'
              )
            end

            @execution_environment.reload
            assert_equal original_name, @execution_environment.name
          end

        end

        describe '#destroy_execution_environment' do
          setup do
            @execution_environment = FactoryBot.create(:execution_environment, organization: @organization)
          end

          test 'destroys execution environment successfully' do
            ee_id = @execution_environment.id

            ::ForemanAnsibleDirector::ExecutionEnvironmentService.destroy_execution_environment(@execution_environment)

            assert_nil ::ForemanAnsibleDirector::ExecutionEnvironment.find_by(id: ee_id)
          end

          test 'destroys execution environment within transaction' do
            @execution_environment.stub(:destroy!, -> { raise ActiveRecord::RecordNotDestroyed }) do
              assert_raises(ActiveRecord::RecordNotDestroyed) do
                ::ForemanAnsibleDirector::ExecutionEnvironmentService.destroy_execution_environment(@execution_environment)
              end
            end

            assert_not_nil ::ForemanAnsibleDirector::ExecutionEnvironment.find_by(id: @execution_environment.id)
          end
        end

        describe '#verify_pull_url!' do
          test 'returns parsed url components for valid http url with tag' do
            result = ::ForemanAnsibleDirector::ExecutionEnvironmentService.send(
              :verify_pull_url!,
              container_image_url: 'http://ghcr.io/ansible-community/community-ee-base:latest'
            )

            assert_equal 'http://ghcr.io/', result[:base]
            assert_equal 'ansible-community/community-ee-base', result[:repository]
            assert_equal 'latest', result[:tag]
          end

          test 'returns parsed url components for valid https url with version tag' do
            result = ::ForemanAnsibleDirector::ExecutionEnvironmentService.send(
              :verify_pull_url!,
              container_image_url: 'https://ghcr.io/ansible-community/community-ee-base:latest'
            )

            assert_equal 'https://ghcr.io/', result[:base]
            assert_equal 'ansible-community/community-ee-base', result[:repository]
            assert_equal 'latest', result[:tag]
          end

          test 'returns parsed url components for valid http url with port' do
            result = ::ForemanAnsibleDirector::ExecutionEnvironmentService.send(
              :verify_pull_url!,
              container_image_url: 'http://localhost:5000/myimage:v1'
            )

            assert_equal 'http://localhost:5000/', result[:base]
            assert_equal 'myimage', result[:repository]
            assert_equal 'v1', result[:tag]
          end

          test 'raises error when url uses non-http scheme' do
            assert_raises(ForemanAnsibleDirector::Issues::CriticalErrorException) do
              ::ForemanAnsibleDirector::ExecutionEnvironmentService.send(:verify_pull_url!, container_image_url: 'docker://quay.io/namespace/repo:latest')
            end

            assert_equal 1, ctx.errors.length
            assert_instance_of ForemanAnsibleDirector::Issues::Errors::InvalidRegistryURL, ctx.errors.first
          end

          test 'raises error when url has no tag' do
            assert_raises(ForemanAnsibleDirector::Issues::CriticalErrorException) do
              ::ForemanAnsibleDirector::ExecutionEnvironmentService.send(:verify_pull_url!, container_image_url: 'https://quay.io/namespace/repo')
            end

            assert_equal 1, ctx.errors.length
            assert_instance_of ForemanAnsibleDirector::Issues::Errors::InvalidRegistryURL, ctx.errors.first
          end

          test 'raises error when url has colon but no tag after it' do
            assert_raises(ForemanAnsibleDirector::Issues::CriticalErrorException) do
              ::ForemanAnsibleDirector::ExecutionEnvironmentService.send(:verify_pull_url!, container_image_url: 'https://quay.io/namespace/repo:')
            end

            assert_equal 1, ctx.errors.length
            assert_instance_of ForemanAnsibleDirector::Issues::Errors::InvalidRegistryURL, ctx.errors.first
          end

          test 'raises error when url has no repository name before tag' do
            assert_raises(ForemanAnsibleDirector::Issues::CriticalErrorException) do
              ::ForemanAnsibleDirector::ExecutionEnvironmentService.send(:verify_pull_url!, container_image_url: 'https://localhost/:latest')
            end

            assert_equal 1, ctx.errors.length
            assert_instance_of ForemanAnsibleDirector::Issues::Errors::InvalidRegistryURL, ctx.errors.first
          end

          test 'raises error on invalid uri syntax' do
            assert_raises(ForemanAnsibleDirector::Issues::CriticalErrorException) do
              ::ForemanAnsibleDirector::ExecutionEnvironmentService.send(:verify_pull_url!, container_image_url: 'https://quay.io/repo[invalid]')
            end

            assert_equal 1, ctx.errors.length
            assert_instance_of ForemanAnsibleDirector::Issues::Errors::InvalidRegistryURL, ctx.errors.first
          end
        end

        describe '#build_execution_environment' do
          setup do
            @execution_environment = FactoryBot.create(:execution_environment, organization: @organization)
            @collection = FactoryBot.create(:ansible_collection, organization: @organization)
            @collection_version = FactoryBot.create(:content_unit_version, :for_collection, versionable: @collection)
          end

          test 'builds execution environment definition' do
            task_called = false
            env_def = nil
            action_name = nil

            ::ForemanAnsibleDirector::ActionService.stub(:trigger, ->(action_class, task_args: {}, mode: :auto) {
              task_called = true
              action_name = action_class.name
              env_def = task_args[:execution_environment_definition]
            }) do
              ::ForemanAnsibleDirector::ExecutionEnvironmentService.build_execution_environment(@execution_environment)
            end

            assert task_called
            assert_equal "ForemanAnsibleDirector::Actions::ExecutionEnvironment::Build", action_name
            assert_not_nil env_def
            assert_equal @execution_environment.container_image_url, env_def[:content][:base_image]
            assert_equal @execution_environment.ansible_version, env_def[:content][:ansible_core_version]
            assert_equal 0, env_def[:content][:content_units].length
          end

          test 'builds execution environment with multiple content units' do
            @role = FactoryBot.create(:ansible_role, organization: @organization)
            @role_version = FactoryBot.create(:content_unit_version, versionable: @role)

            FactoryBot.create(
              :execution_environment_content_unit,
              execution_environment: @execution_environment,
              content_unit: @role,
              content_unit_version: @role_version
            )
            FactoryBot.create(
              :execution_environment_content_unit,
              execution_environment: @execution_environment,
              content_unit: @collection,
              content_unit_version: @collection_version
            )
            @execution_environment.reload
            task_called = false
            env_def = nil

            ::ForemanAnsibleDirector::ActionService.stub(:trigger, ->(action_class, task_args: {}, mode: :auto) {
              task_called = true
              env_def = task_args[:execution_environment_definition]
            }) do
              ::ForemanAnsibleDirector::ExecutionEnvironmentService.build_execution_environment(@execution_environment)
            end

            assert task_called
            assert_equal 2, env_def[:content][:content_units].length

            types = env_def[:content][:content_units].map { |cu| cu[:type] }
            assert_includes types, 'collection'
            assert_includes types, 'role'
          end

          test 'issues critical error if staging product missing' do
            as_admin do
              @staging_product.destroy!
            end
            assert_raises(ForemanAnsibleDirector::Issues::CriticalErrorException) do
              ::ForemanAnsibleDirector::ExecutionEnvironmentService.build_execution_environment(@execution_environment)
            end

            assert_equal 1, ctx.errors.length
            assert_instance_of ForemanAnsibleDirector::Issues::Errors::StagingProductMissing, ctx.errors.first
          end

          test 'issues critical error if no build proxy available' do
            ::ForemanAnsibleDirector::AnsibleDirectorBuildProxySelector.any_instance.stubs(:determine_proxy).returns(nil)

            assert_raises(ForemanAnsibleDirector::Issues::CriticalErrorException) do
              ::ForemanAnsibleDirector::ExecutionEnvironmentService.build_execution_environment(@execution_environment)
            end

            assert_equal 1, ctx.errors.length
            assert_instance_of ForemanAnsibleDirector::Issues::Errors::NoProxyForBuild, ctx.errors.first
          end

        end

        describe '#import_execution_environment' do
          test 'creates an execution environment with source image_import and status running' do
            fake_task = Struct.new(:id).new(42)
            ::ForemanAnsibleDirector::ActionService.stub(:trigger, ->(action_class, task_args: {}, mode: :auto) {
              fake_task
            }) do
              ee = ::ForemanAnsibleDirector::ExecutionEnvironmentService.import_execution_environment(
                name: 'imported_ee',
                container_image_url: 'https://ghcr.io/ansible-community/community-ee-base:latest',
                verify_ssl: true,
                organization_id: @organization.id
              )

              assert_not_nil ee
              assert_equal 'imported_ee', ee.name
              assert_equal 'https://ghcr.io/ansible-community/community-ee-base:latest', ee.container_image_url
              assert_equal 'image_import', ee.source
              assert_equal 'running', ee.status
            end
          end

          test 'assigns latest_task_id after triggering import action' do
            imported_ee_id = nil
            expected_task_id = "123e4567-e89b-12d3-a456-426614174000"

            ::ForemanAnsibleDirector::ActionService.stub(:trigger, ->(action_class, task_args: {}, mode: :auto) {
              fake_task = Struct.new(:id).new(expected_task_id)
              fake_task
            }) do
              ee = ::ForemanAnsibleDirector::ExecutionEnvironmentService.import_execution_environment(
                name: 'imported_ee',
                container_image_url: 'https://ghcr.io/ansible-community/community-ee-base:latest',
                verify_ssl: true,
                organization_id: @organization.id
              )
              imported_ee_id = ee.id
            end

            assert_not_nil imported_ee_id
            ee = ::ForemanAnsibleDirector::ExecutionEnvironment.find_by(id: imported_ee_id)
            assert_not_nil ee
            assert_equal expected_task_id, ee.latest_task_id
          end

          test 'raises error when container_image_url is invalid' do
            initial_count = ::ForemanAnsibleDirector::ExecutionEnvironment.count

            assert_raises(ForemanAnsibleDirector::Issues::CriticalErrorException) do
              ::ForemanAnsibleDirector::ExecutionEnvironmentService.import_execution_environment(
                name: 'invalid_ee',
                container_image_url: 'docker://quay.io/namespace/image:latest',
                verify_ssl: true,
                organization_id: @organization.id
              )
            end

            assert_equal initial_count, ::ForemanAnsibleDirector::ExecutionEnvironment.count
            assert_equal 1, ctx.errors.length
            assert_instance_of ForemanAnsibleDirector::Issues::Errors::InvalidRegistryURL, ctx.errors.first
          end
        end

        describe '#clone_execution_environment_image' do
          test 'triggers import action with correct katello_repository_options' do
            ee = FactoryBot.create(:execution_environment, organization: @organization)

            url_components = {
              base: 'https://ghcr.io/',
              repository: 'ansible-community/community-ee-base',
              tag: '2.21.5-1',
            }

            import_triggered = false
            received_task_args = nil

            ::ForemanAnsibleDirector::ActionService.stub(:trigger, ->(action_class, task_args: {}, mode: :auto) {
              import_triggered = true
              received_task_args = task_args
            }) do
              ::ForemanAnsibleDirector::ExecutionEnvironmentService.clone_execution_environment_image(
                execution_environment: ee,
                container_image_url_components: url_components,
                verify_ssl: true
              )
            end

            assert import_triggered
            assert_not_nil received_task_args[:katello_repository_options]

            opts = received_task_args[:katello_repository_options]
            expected_name = "#{::ForemanAnsibleDirector::Constants::EE_IMAGE_BASENAME}_#{ee.id}"
            expected_label = "#{::ForemanAnsibleDirector::Constants::EE_IMAGE_BASENAME}_#{ee.id}"
            assert_equal expected_name, opts[:name]
            assert_equal expected_label, opts[:label]
            assert_equal 'immediate', opts[:download_policy]
            assert_equal true, opts[:unprotected]
            assert_equal 'docker', opts[:content_type]
            assert_equal 'mirror_content_only', opts[:mirroring_policy]
            assert_equal @staging_product.id, opts['product_id']
            assert_equal 'https://ghcr.io/', opts[:url]
            assert_equal 'ansible-community/community-ee-base', opts[:docker_upstream_name]
            assert_includes opts[:include_tags], '2.21.5-1'
            assert_equal true, opts[:verify_ssl_on_sync]
          end

          test 'sets verify_ssl_on_sync based on parameter' do
            ee = FactoryBot.create(:execution_environment, organization: @organization)

            url_components = {
              base: 'https://ghcr.io/',
              repository: 'ansible-community/community-ee-base',
              tag: '2.21.5-1',
            }

            import_triggered = false
            received_task_args = nil

            ::ForemanAnsibleDirector::ActionService.stub(:trigger, ->(action_class, task_args: {}, mode: :auto) {
              import_triggered = true
              received_task_args = task_args
            }) do
              ::ForemanAnsibleDirector::ExecutionEnvironmentService.clone_execution_environment_image(
                execution_environment: ee,
                container_image_url_components: url_components,
                verify_ssl: false
              )
            end

            assert import_triggered
            opts = received_task_args[:katello_repository_options]
            assert_equal false, opts[:verify_ssl_on_sync]
          end
        end

        describe '#katello_repository_options' do
          test 'returns an ActiveSupport::HashWithIndifferentAccess' do
            ee = FactoryBot.create(:execution_environment, organization: @organization)

            url_components = {
              base: 'https://ghcr.io/',
              repository: 'ansible-community/community-ee-base',
              tag: '2.21.5-1',
            }

            result = ::ForemanAnsibleDirector::ExecutionEnvironmentService.send(
              :katello_repository_options,
              execution_environment: ee,
              staging_product_id: @staging_product.id,
              container_image_url_components: url_components,
              verify_ssl: true
            )

            assert_instance_of ActiveSupport::HashWithIndifferentAccess, result
          end

          test 'uses Execution Environment id in name and label' do
            ee = FactoryBot.create(:execution_environment, organization: @organization, id: 42)

            url_components = {
              base: 'https://ghcr.io/',
              repository: 'ansible-community/community-ee-base',
              tag: '2.21.5-1',
            }

            result = ::ForemanAnsibleDirector::ExecutionEnvironmentService.send(
              :katello_repository_options,
              execution_environment: ee,
              staging_product_id: @staging_product.id,
              container_image_url_components: url_components,
              verify_ssl: false
            )

            assert_equal "#{::ForemanAnsibleDirector::Constants::EE_IMAGE_BASENAME}_42", result[:name]
            assert_equal "#{::ForemanAnsibleDirector::Constants::EE_IMAGE_BASENAME}_42", result[:label]
          end

          test 'passes through URL components correctly' do
            ee = FactoryBot.create(:execution_environment, organization: @organization)

            url_components = {
              base: 'https://localhost:5000/',
              repository: 'my-repo/ee-image',
              tag: 'v2.0.0',
            }

            result = ::ForemanAnsibleDirector::ExecutionEnvironmentService.send(
              :katello_repository_options,
              execution_environment: ee,
              staging_product_id: @staging_product.id,
              container_image_url_components: url_components,
              verify_ssl: true
            )

            assert_equal 'https://localhost:5000/', result[:url]
            assert_equal 'my-repo/ee-image', result[:docker_upstream_name]
            assert_includes result[:include_tags], 'v2.0.0'
          end

          test 'includes all expected keys' do
            ee = FactoryBot.create(:execution_environment, organization: @organization)

            url_components = {
              base: 'https://quay.io/',
              repository: 'namespace/image',
              tag: 'latest',
            }

            result = ::ForemanAnsibleDirector::ExecutionEnvironmentService.send(
              :katello_repository_options,
              execution_environment: ee,
              staging_product_id: @staging_product.id,
              container_image_url_components: url_components,
              verify_ssl: true
            )

            expected_keys = [
              :name, :label, :download_policy, :content_type, :unprotected,
              :product_id, :url, :docker_upstream_name, :include_tags,
              :mirroring_policy, :verify_ssl_on_sync
            ]
            expected_keys.each do |key|
              assert result.key?(key), "Expected result to include key #{key}"
            end
          end
        end
      end
    end
  end
end