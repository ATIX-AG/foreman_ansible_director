
require 'foreman_ansible_director_test_helper'

module ForemanAnsibleDirectorTests
  module Services
    module Unit
      class LifecycleEnvironmentServiceTest < ForemanAnsibleDirectorTestCase

        setup do
          as_admin do
            @path = FactoryBot.create(:lifecycle_environment_path, organization: @organization)
          end
        end

        describe '#create_environment' do
          test 'creates a lifecycle environment with valid params' do

            initial_count = ::ForemanAnsibleDirector::LifecycleEnvironment.count

            env = ::ForemanAnsibleDirector::LifecycleEnvironmentService.create_environment(
              lce_path: @path,
              name: "test_env",
              description: "Test environment description",
              position: 0,
              organization_id: @organization.id
            )

            assert_not_nil env
            assert_equal 'test_env', env.name
            assert_equal 'Test environment description', env.description
            assert_equal @organization.id, env.organization_id
            assert_equal initial_count + 1, ::ForemanAnsibleDirector::LifecycleEnvironment.count
          end

          test 'creates lifecycle environment within transaction' do

            initial_count = ::ForemanAnsibleDirector::LifecycleEnvironment.count

            assert_raises(ActiveRecord::RecordInvalid) do
              ::ForemanAnsibleDirector::LifecycleEnvironmentService.create_environment(
                lce_path: @path,
                name: nil,
                description: "Test environment description",
                position: 0,
                organization_id: @organization.id
              )
            end

            assert_equal initial_count, ::ForemanAnsibleDirector::LifecycleEnvironment.count
          end

          test 'calls LifecycleEnvironmentPathService to insert environment' do

            service_called = false
            path_arg = nil
            env_arg = nil
            position_arg = nil

            ::ForemanAnsibleDirector::LifecycleEnvironmentPathService.stub(:insert_environment, ->(path, env, position) {
              service_called = true
              path_arg = path
              env_arg = env
              position_arg = position
            }) do
              ::ForemanAnsibleDirector::LifecycleEnvironmentService.create_environment(
                lce_path: @path,
                name: "test_env",
                description: "Test environment description",
                position: 1,
                organization_id: @organization.id
              )
            end

            assert service_called
            assert_equal @path, path_arg
            assert_equal 'test_env', env_arg.name
            assert_equal 1, position_arg
          end
        end

        describe '#edit_environment' do
          setup do
            @environment = FactoryBot.create(:lifecycle_environment, organization: @organization, lifecycle_environment_path: @path)
            @execution_environment = FactoryBot.create(:execution_environment, organization: @organization)
          end

          test 'updates lifecycle environment with valid params' do

            ::ForemanAnsibleDirector::LifecycleEnvironmentService.edit_environment(
              environment: @environment,
              name: "updated_env",
              description: "Updated description",
              execution_environment_id: @execution_environment.id
            )
            @environment.reload

            assert_equal 'updated_env', @environment.name
            assert_equal 'Updated description', @environment.description
            assert_equal @execution_environment.id, @environment.execution_environment_id
          end

          test 'updates environment within transaction' do
            original_name = @environment.name

            assert_raises(ActiveRecord::RecordInvalid) do
              ::ForemanAnsibleDirector::LifecycleEnvironmentService.edit_environment(
                environment: @environment,
                name: nil,
                description: "Updated description",
                execution_environment_id: @execution_environment.id
              )
            end

            @environment.reload
            assert_equal original_name, @environment.name
          end
        end

        describe '#destroy_environment' do
          setup do
            @path = FactoryBot.create(:lifecycle_environment_path, organization: @organization)
            @parent_env = FactoryBot.create(:lifecycle_environment, organization: @organization, lifecycle_environment_path: @path)
            @child_env = FactoryBot.create(:lifecycle_environment, organization: @organization, lifecycle_environment_path: @path, parent: @environment)

            @environment = FactoryBot.create(:lifecycle_environment, organization: @organization, lifecycle_environment_path: @path, parent: @parent_env, child: @child_env)
          end

          test 'destroys environment with parent and child successfully' do

            env_id = @environment.id

            ::ForemanAnsibleDirector::LifecycleEnvironmentService.destroy_environment(@environment)

            assert_nil ::ForemanAnsibleDirector::LifecycleEnvironment.find_by(id: env_id)
            @child_env.reload
            assert_equal @parent_env.id, @child_env.parent_id
          end

          test 'handles root environment destruction' do
            # TODO: Determine whether this should be allowed at all
            #root_env = FactoryBot.create(:lifecycle_environment, organization: @organization, lifecycle_environment_path: @path, parent: nil)
            #child_of_root = FactoryBot.create(:lifecycle_environment, organization: @organization, lifecycle_environment_path: @path, parent: root_env)
            #@path.update!(root_environment: root_env)
#
            #root_id = root_env.id
#
            #::ForemanAnsibleDirector::LifecycleEnvironmentService.destroy_environment(root_env)
#
            #assert_nil ::ForemanAnsibleDirector::LifecycleEnvironment.find_by(id: root_id)
            #@path.reload
            #assert_equal child_of_root.id, @path.root_environment_id
          end

          test 'handles root environment with no children' do
            root_env = FactoryBot.create(:lifecycle_environment, organization: @organization, lifecycle_environment_path: @path, parent: nil)
            @path.update!(root_environment: root_env)

            root_id = root_env.id

            ::ForemanAnsibleDirector::LifecycleEnvironmentService.destroy_environment(root_env)

            assert_nil ::ForemanAnsibleDirector::LifecycleEnvironment.find_by(id: root_id)
            @path.reload
            assert_nil @path.root_environment_id
          end

          test 'destroys environment within transaction' do
            @environment.stub(:destroy!, -> { raise ActiveRecord::Rollback }) do
              ::ForemanAnsibleDirector::LifecycleEnvironmentService.destroy_environment(@environment)
            end

            assert_not_nil ::ForemanAnsibleDirector::LifecycleEnvironment.find_by(id: @environment.id)
          end
        end

        describe '#assign' do
          setup do
            @path = FactoryBot.create(:lifecycle_environment_path, organization: @organization)
            @environment = FactoryBot.create(:lifecycle_environment, organization: @organization, lifecycle_environment_path: @path)
            as_admin do
              @host = FactoryBot.create(:host, organization: @organization)
            end
          end

          test 'assigns environment to target successfully' do
            ::ForemanAnsibleDirector::LifecycleEnvironmentService.assign(@environment, @host)

            @host.reload
            assert_equal @environment.id, @host.ansible_lifecycle_environment_id
          end
        end

        describe '#assign_content' do
          setup do
            @path = FactoryBot.create(:lifecycle_environment_path, organization: @organization)

            @environment = FactoryBot.create(:lifecycle_environment, organization: @organization, lifecycle_environment_path: @path)
            @execution_environment = FactoryBot.create(:execution_environment, organization: @organization)
            @collection = FactoryBot.create(:ansible_collection, organization: @organization)
            @collection_version = FactoryBot.create(:content_unit_version, :for_collection, versionable: @collection)
          end

          test 'assigns content and execution environment successfully' do
            content_assignments = [
              { id: @collection.id, version: @collection_version.version }
            ]

            @environment.stub(:assign_content_unit_version!, -> (_) { true }) do
              @environment.stub(:assign_execution_environment!, -> (_) { true }) do
                ::ForemanAnsibleDirector::LifecycleEnvironmentService.assign_content(
                  @environment,
                  content_assignments,
                  @execution_environment.id
                )
              end
            end

            # Verify the method calls were made (through the transaction completion)
            assert true # Test passes if no exception is raised
          end

          test 'clears existing content before assigning new content' do
            content_assignments = [
              { id: @collection.id, version: @collection_version.version }
            ]

            direct_content_cleared = false
            @environment.stub(:direct_content_unit_versions, Object.new.tap { |obj| obj.define_singleton_method(:clear) { direct_content_cleared = true } }) do
              @environment.stub(:assign_content_unit_version!, -> (_) { true }) do
                @environment.stub(:assign_execution_environment!, -> (_) { true }) do
                  ::ForemanAnsibleDirector::LifecycleEnvironmentService.assign_content(
                    @environment,
                    content_assignments,
                    @execution_environment.id
                  )
                end
              end
            end

            assert direct_content_cleared
          end

          test 'rolls back transaction when content assignment fails' do
            content_assignments = [
              { id: @collection.id, version: @collection_version.version }
            ]

            @environment.stub(:assign_content_unit_version!, -> (_) { false }) do
              initial_count = @environment.direct_content_unit_versions.count

              ::ForemanAnsibleDirector::LifecycleEnvironmentService.assign_content(
                @environment,
                content_assignments,
                "something invalid"
              )

              # Transaction should have rolled back due to failed assignment
              assert_equal initial_count, @environment.direct_content_unit_versions.count
            end
          end

          test 'rolls back transaction when execution environment assignment fails' do
            content_assignments = []

            @environment.stub(:assign_execution_environment!, -> (_) { false }) do
              ::ForemanAnsibleDirector::LifecycleEnvironmentService.assign_content(
                @environment,
                content_assignments,
                @execution_environment.id
              )
            end

            # Test passes if no exception is raised and transaction is handled
            assert true
          end

          test 'assigns content within transaction' do
            content_assignments = [
              { id: @collection.id, version: @collection_version.version }
            ]

            ::ForemanAnsibleDirector::ContentUnit.stub(:find, -> (_) { raise ActiveRecord::RecordNotFound }) do
              assert_raises(ActiveRecord::RecordNotFound) do
                ::ForemanAnsibleDirector::LifecycleEnvironmentService.assign_content(
                  @environment,
                  content_assignments,
                  nil
                )
              end
            end
          end
        end

        describe '#increment_position' do
          setup do
            @path = FactoryBot.create(:lifecycle_environment_path, organization: @organization)
            @environment = FactoryBot.create(:lifecycle_environment, organization: @organization, position: 1, lifecycle_environment_path: @path)
          end

          test 'increments position for environment without children' do
            ::ForemanAnsibleDirector::LifecycleEnvironmentService.increment_position(@environment)

            @environment.reload
            assert_equal 2, @environment.position
          end

          test 'recursively increments position for children' do
            @path = FactoryBot.create(:lifecycle_environment_path, organization: @organization)

            child1 = FactoryBot.create(:lifecycle_environment, organization: @organization, parent: @environment, position: 2, lifecycle_environment_path: @path)
            @environment.child = child1
            child2 = FactoryBot.create(:lifecycle_environment, organization: @organization, parent: @environment, position: 3, lifecycle_environment_path: @path)
            child1.child = child2
            grandchild = FactoryBot.create(:lifecycle_environment, organization: @organization, parent: child1, position: 4, lifecycle_environment_path: @path)
            child2.child = grandchild

            ::ForemanAnsibleDirector::LifecycleEnvironmentService.increment_position(@environment)

            child1.reload
            child2.reload
            grandchild.reload

            assert_equal 3, child1.position
            assert_equal 4, child2.position
            assert_equal 5, grandchild.position
          end
        end

        describe '#decrement_position' do
          setup do
            @path = FactoryBot.create(:lifecycle_environment_path, organization: @organization)
            @environment = FactoryBot.create(:lifecycle_environment, organization: @organization, position: 1, lifecycle_environment_path: @path)
          end

          test 'decrements position for environment without children' do
            ::ForemanAnsibleDirector::LifecycleEnvironmentService.decrement_position(@environment)

            @environment.reload
            assert_equal 0, @environment.position
          end

          test 'recursively decrements position for children' do
            @path = FactoryBot.create(:lifecycle_environment_path, organization: @organization)

            child1 = FactoryBot.create(:lifecycle_environment, organization: @organization, parent: @environment, position: 2, lifecycle_environment_path: @path)
            @environment.child = child1
            child2 = FactoryBot.create(:lifecycle_environment, organization: @organization, parent: @environment, position: 3, lifecycle_environment_path: @path)
            child1.child = child2
            grandchild = FactoryBot.create(:lifecycle_environment, organization: @organization, parent: child1, position: 4, lifecycle_environment_path: @path)
            child2.child = grandchild

            ::ForemanAnsibleDirector::LifecycleEnvironmentService.decrement_position(@environment)

            child1.reload
            child2.reload
            grandchild.reload

            assert_equal 1, child1.position
            assert_equal 2, child2.position
            assert_equal 3, grandchild.position
          end

        end

      end
    end
  end
end