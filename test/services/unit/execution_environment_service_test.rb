require 'foreman_ansible_director_test_helper'

module ForemanAnsibleDirectorTests
  module Services
    module Unit
      class ExecutionEnvironmentServiceTest < ForemanAnsibleDirectorTestCase

        describe '#create_execution_environment' do
          test 'creates an execution environment with valid params' do

            ee_create = ::ForemanAnsibleDirector::Structs::ExecutionEnvironment::ExecutionEvironmentCreate.new("test_ee", "quay.io/ansible/base-ee:latest", "2.20.0", @organization.id
            )

            ee = ::ForemanAnsibleDirector::ExecutionEnvironmentService.create_execution_environment(ee_create)

            assert_not_nil ee
            assert_equal 'test_ee', ee.name
            assert_equal 'quay.io/ansible/base-ee:latest', ee.base_image_url
            assert_equal '2.20.0', ee.ansible_version
          end

          test 'triggers execution environment build' do

            ee_create = ::ForemanAnsibleDirector::Structs::ExecutionEnvironment::ExecutionEvironmentCreate.new(
              "test_ee",
              "quay.io/ansible/base-ee:latest",
              "2.20.0",
              @organization.id
            )

            task_called = false
            action_name = nil
            env_def = nil

            ForemanTasks.stub(:async_task, ->(action, **args) { task_called = true
            action_name = action.name
            env_def = args[:execution_environment_definition]
            }) do
              ::ForemanAnsibleDirector::ExecutionEnvironmentService.create_execution_environment(ee_create)
            end

            assert task_called
            assert_equal "ForemanAnsibleDirector::Actions::Proxy::BuildExecutionEnvironment", action_name
            assert_not_nil env_def
          end

          test 'creates execution environment within transaction' do
            ee_create = ::ForemanAnsibleDirector::Structs::ExecutionEnvironment::ExecutionEvironmentCreate.new(
              nil,
              "quay.io/ansible/base-ee:latest",
              "2.20.0",
              @organization.id
            )

            initial_count = ::ForemanAnsibleDirector::ExecutionEnvironment.count

            assert_raises(ActiveRecord::RecordInvalid) do
              ::ForemanAnsibleDirector::ExecutionEnvironmentService.create_execution_environment(ee_create)
            end

            assert_equal initial_count, ::ForemanAnsibleDirector::ExecutionEnvironment.count
          end
        end

        describe '#edit_execution_environment' do
          setup do
            @execution_environment = FactoryBot.create(:execution_environment, organization: @organization)
          end

          test 'updates execution environment with valid params' do
            ee_update = ::ForemanAnsibleDirector::Structs::ExecutionEnvironment::ExecutionEvironmentCreate.new(
              "updated_ee",
              "quay.io/ansible/updated-ee:latest",
              "2.19.0"
            )

            ::ForemanAnsibleDirector::ExecutionEnvironmentService.edit_execution_environment(ee_update, @execution_environment)
            @execution_environment.reload

            assert_equal 'updated_ee', @execution_environment.name
            assert_equal 'quay.io/ansible/updated-ee:latest', @execution_environment.base_image_url
            assert_equal '2.19.0', @execution_environment.ansible_version
          end

          test 'triggers execution environment build on hash change' do

            task_called = false
            action_name = nil
            env_def = nil

            ee_update = ::ForemanAnsibleDirector::Structs::ExecutionEnvironment::ExecutionEnvironmentEdit.new(
              "edited_name",
              @execution_environment.base_image_url,
              @execution_environment.ansible_version
            )

            ForemanTasks.stub(:async_task, ->(action, **args) { task_called = true
            action_name = action.name
            env_def = args[:execution_environment_definition]
            }) do
              ::ForemanAnsibleDirector::ExecutionEnvironmentService.edit_execution_environment(ee_update, @execution_environment)
            end

            @execution_environment.reload

            assert_not task_called
            assert_nil action_name
            assert_nil env_def

            ee_update = ::ForemanAnsibleDirector::Structs::ExecutionEnvironment::ExecutionEnvironmentEdit.new(
              @execution_environment.name,
              "quay.io/fedora/fedora:42",
              @execution_environment.ansible_version
            )

            ForemanTasks.stub(:async_task, ->(action, **args) { task_called = true
            action_name = action.name
            env_def = args[:execution_environment_definition]
            }) do
              ::ForemanAnsibleDirector::ExecutionEnvironmentService.edit_execution_environment(ee_update, @execution_environment)
            end

            assert task_called
            assert_equal "ForemanAnsibleDirector::Actions::Proxy::BuildExecutionEnvironment", action_name
            assert_not_nil env_def

            task_called = false
            action_name = nil
            env_def = nil

            ee_update = ::ForemanAnsibleDirector::Structs::ExecutionEnvironment::ExecutionEnvironmentEdit.new(
              @execution_environment.name,
              @execution_environment.base_image_url,
              "2.19.3"
            )

            ForemanTasks.stub(:async_task, ->(action, **args) { task_called = true
            action_name = action.name
            env_def = args[:execution_environment_definition]
            }) do
              ::ForemanAnsibleDirector::ExecutionEnvironmentService.edit_execution_environment(ee_update, @execution_environment)
            end

            assert task_called
            assert_equal "ForemanAnsibleDirector::Actions::Proxy::BuildExecutionEnvironment", action_name
            assert_not_nil env_def

          end

          test 'updates execution environment within transaction' do
            original_name = @execution_environment.name

            ee_update = ::ForemanAnsibleDirector::Structs::ExecutionEnvironment::ExecutionEnvironmentEdit.new(
              nil,
              'quay.io/ansible/base-ee:latest',
              '2.19.0'
            )

            assert_raises(ActiveRecord::RecordInvalid) do
              ::ForemanAnsibleDirector::ExecutionEnvironmentService.edit_execution_environment(ee_update, @execution_environment)
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

            ForemanTasks.stub(:async_task, ->(action, **args) { task_called = true
            action_name = action.name
            env_def = args[:execution_environment_definition]
            }) do
              ::ForemanAnsibleDirector::ExecutionEnvironmentService.build_execution_environment(@execution_environment)
            end

            assert task_called
            assert_equal "ForemanAnsibleDirector::Actions::Proxy::BuildExecutionEnvironment", action_name
            assert_not_nil env_def
            assert_equal @execution_environment.base_image_url, env_def[:content][:base_image]
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

            ForemanTasks.stub(:async_task, ->(action, **args) { task_called = true
            env_def = args[:execution_environment_definition]
            }) do
              ::ForemanAnsibleDirector::ExecutionEnvironmentService.build_execution_environment(@execution_environment)
            end

            assert task_called
            assert_equal 2, env_def[:content][:content_units].length

            types = env_def[:content][:content_units].map { |cu| cu[:type] }
            assert_includes types, 'collection'
            assert_includes types, 'role'
          end

          test 'uses async task in production environment' do
            Rails.env.stub(:development?, false) do
              task_called = false

              ForemanTasks.stub(:async_task, ->(action, **args) { task_called = true
              }) do
                ::ForemanAnsibleDirector::ExecutionEnvironmentService.build_execution_environment(@execution_environment)
              end

              assert task_called
            end
          end

          test 'uses sync task in development environment' do
            Rails.env.stub(:development?, true) do
              task_called = false

              ForemanTasks.stub(:sync_task, ->(action, **args) { task_called = true
              }) do
                ::ForemanAnsibleDirector::ExecutionEnvironmentService.build_execution_environment(@execution_environment)
              end

              assert task_called
            end
          end

        end

      end
    end
  end
end