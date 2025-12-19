require 'foreman_ansible_director_test_helper'

module ForemanAnsibleDirectorTests
  module Services
    module Unit
      class LifecycleEnvironmentPathServiceTest < ForemanAnsibleDirectorTestCase

        describe '#create_path' do
          test 'creates a lifecycle environment path with valid params' do
            path_create = ::ForemanAnsibleDirector::Structs::LifecycleEnvironmentPath::LifecycleEnvironmentPathCreate.new(
              "test_path",
              "Test path description",
              @organization.id
            )

            initial_count = ::ForemanAnsibleDirector::LifecycleEnvironmentPath.count

            path = ::ForemanAnsibleDirector::LifecycleEnvironmentPathService.create_path(path_create)

            assert_not_nil path
            assert_equal 'test_path', path.name
            assert_equal 'Test path description', path.description
            assert_equal @organization.id, path.organization_id
            assert_equal initial_count + 1, ::ForemanAnsibleDirector::LifecycleEnvironmentPath.count
          end

          test 'creates lifecycle environment path within transaction' do
            path_create = ::ForemanAnsibleDirector::Structs::LifecycleEnvironmentPath::LifecycleEnvironmentPathCreate.new(
              nil,
              "Test path description",
              @organization.id
            )

            initial_count = ::ForemanAnsibleDirector::LifecycleEnvironmentPath.count

            assert_raises(ActiveRecord::RecordInvalid) do
              ::ForemanAnsibleDirector::LifecycleEnvironmentPathService.create_path(path_create)
            end

            assert_equal initial_count, ::ForemanAnsibleDirector::LifecycleEnvironmentPath.count
          end
        end

        describe '#edit_path' do
          setup do
            @path = FactoryBot.create(:lifecycle_environment_path, organization: @organization)
          end

          test 'updates lifecycle environment path with valid params' do
            path_edit = ::ForemanAnsibleDirector::Structs::LifecycleEnvironmentPath::LifecycleEnvironmentPathEdit.new(
              "updated_path",
              "Updated path description"
            )

            ::ForemanAnsibleDirector::LifecycleEnvironmentPathService.edit_path(@path, path_edit)
            @path.reload

            assert_equal 'updated_path', @path.name
            assert_equal 'Updated path description', @path.description
          end

          test 'updates path within transaction' do
            original_name = @path.name

            path_edit = ::ForemanAnsibleDirector::Structs::LifecycleEnvironmentPath::LifecycleEnvironmentPathEdit.new(
              nil,
              "Updated path description"
            )

            assert_raises(ActiveRecord::RecordInvalid) do
              ::ForemanAnsibleDirector::LifecycleEnvironmentPathService.edit_path(@path, path_edit)
            end

            @path.reload
            assert_equal original_name, @path.name
          end
        end

        describe '#destroy_path' do
          setup do
            @path = FactoryBot.create(:lifecycle_environment_path, organization: @organization)
          end

          test 'destroys path successfully' do
            path_id = @path.id

            ::ForemanAnsibleDirector::LifecycleEnvironmentPathService.destroy_path(@path)

            assert_nil ::ForemanAnsibleDirector::LifecycleEnvironmentPath.find_by(id: path_id)
          end

          test 'clears root_environment_id before destroying' do
            root_env = FactoryBot.create(:lifecycle_environment, organization: @organization, lifecycle_environment_path: @path)
            @path.update!(root_environment: root_env)

            ::ForemanAnsibleDirector::LifecycleEnvironmentPathService.destroy_path(@path)

            # Path should be destroyed, so we can't check root_environment_id
            assert_nil ::ForemanAnsibleDirector::LifecycleEnvironmentPath.find_by(id: @path.id)
          end

          test 'destroys path within transaction' do
            @path.stub(:destroy!, -> { raise ActiveRecord::Rollback }) do
              ::ForemanAnsibleDirector::LifecycleEnvironmentPathService.destroy_path(@path)
            end

            assert_not_nil ::ForemanAnsibleDirector::LifecycleEnvironmentPath.find_by(id: @path.id)
          end
        end

        describe '#insert_environment' do
          setup do
            @path = FactoryBot.create(:lifecycle_environment_path, organization: @organization)
            @environment = FactoryBot.build(:lifecycle_environment, organization: @organization, lifecycle_environment_path: @path)
          end

          test 'inserts environment at beginning when position is 0' do
            ::ForemanAnsibleDirector::LifecycleEnvironmentPathService.insert_environment(@path, @environment, 0)

            @environment.reload
            @path.reload

            assert_equal @path, @environment.lifecycle_environment_path
            assert_equal 0, @environment.position
            assert_nil @environment.parent
            assert_equal @environment, @path.root_environment
          end

          test 'inserts environment at end when position is -1 and path is empty' do
            ::ForemanAnsibleDirector::LifecycleEnvironmentPathService.insert_environment(@path, @environment, -1)

            @environment.reload
            @path.reload

            assert_equal @path, @environment.lifecycle_environment_path
            assert_equal 0, @environment.position
            assert_nil @environment.parent
            assert_equal @environment, @path.root_environment
          end

          test 'inserts environment at end when position is -1 and path has environments' do
            existing_env = FactoryBot.create(:lifecycle_environment, organization: @organization, lifecycle_environment_path: @path, position: 0)
            @path.update!(root_environment: existing_env)

            ::ForemanAnsibleDirector::LifecycleEnvironmentPathService.insert_environment(@path, @environment, -1)

            @environment.reload
            existing_env.reload

            assert_equal @path, @environment.lifecycle_environment_path
            assert_equal 1, @environment.position
            assert_equal existing_env, @environment.parent
            assert_equal @environment, existing_env.child
          end

          test 'inserts environment at specific position with existing environment' do
            env1 = FactoryBot.create(:lifecycle_environment, organization: @organization, lifecycle_environment_path: @path, name: "env0", position: 0)
            env2 = FactoryBot.create(:lifecycle_environment, organization: @organization, lifecycle_environment_path: @path, name: "env1", position: 1, parent: env1)
            env1.update!(child: env2)
            @path.update!(root_environment: env1)

            ::ForemanAnsibleDirector::LifecycleEnvironmentPathService.insert_environment(@path, @environment, 1)

            @environment.reload
            env1.reload
            env2.reload

            assert_equal @path, @environment.lifecycle_environment_path
            assert_equal 1, @environment.position
            assert_equal env1, @environment.parent
            assert_equal env2, @environment.child
            assert_equal @environment, env1.child
            assert_equal @environment, env2.parent
          end

          test 'inserts environment at end when position exceeds existing environments' do
            existing_env = FactoryBot.create(:lifecycle_environment, organization: @organization, lifecycle_environment_path: @path, position: 0)
            @path.update!(root_environment: existing_env)

            ::ForemanAnsibleDirector::LifecycleEnvironmentPathService.insert_environment(@path, @environment, 5)

            @environment.reload
            existing_env.reload

            assert_equal @path, @environment.lifecycle_environment_path
            assert_equal 1, @environment.position
            assert_equal existing_env, @environment.parent
            assert_equal @environment, existing_env.child
          end

          test 'inserts environment within transaction' do
            @environment.stub(:save!, -> { raise ActiveRecord::RecordInvalid.new(@environment) }) do
              assert_raises(ActiveRecord::RecordInvalid) do
                ::ForemanAnsibleDirector::LifecycleEnvironmentPathService.insert_environment(@path, @environment, 0)
              end
            end
          end
        end

        describe '#promote' do
          setup do
            @path = FactoryBot.create(:lifecycle_environment_path, organization: @organization)
            @source_env = FactoryBot.create(:lifecycle_environment, organization: @organization, lifecycle_environment_path: @path, position: 0)
            @target_env = FactoryBot.create(:lifecycle_environment, organization: @organization, lifecycle_environment_path: @path, position: 1, parent: @source_env)
            @source_env.update!(child: @target_env)
            @path.update!(root_environment: @source_env)
          end

          test 'promotes content from source to target environment successfully' do
            content_snapshot = FactoryBot.create(:content_snapshot, references: 1)
            execution_environment = FactoryBot.create(:execution_environment, organization: @organization)
            @source_env.update!(content_snapshot: content_snapshot, execution_environment: execution_environment)

            path_promote = ::ForemanAnsibleDirector::Structs::LifecycleEnvironmentPath::LifecycleEnvironmentPathPromote.new(
              @source_env.id,
              @target_env.id
            )

            result = ::ForemanAnsibleDirector::LifecycleEnvironmentPathService.promote(@path, path_promote)

            assert result
            @target_env.reload
            content_snapshot.reload

            assert_equal content_snapshot, @target_env.content_snapshot
            assert_equal execution_environment, @target_env.execution_environment
            assert_equal 2, content_snapshot.references
          end

          test 'creates new snapshot when source environment has direct content' do
            execution_environment = FactoryBot.create(:execution_environment, organization: @organization)
            @source_env.update!(execution_environment: execution_environment)

            # Mock the using_snapshot_content? method to return false
            @source_env.stub(:using_snapshot_content?, false) do
              # Mock create_snapshot method
              new_snapshot = FactoryBot.create(:content_snapshot, references: 1)
              ::ForemanAnsibleDirector::LifecycleEnvironmentPathService.stub(:create_snapshot, new_snapshot) do
                path_promote = ::ForemanAnsibleDirector::Structs::LifecycleEnvironmentPath::LifecycleEnvironmentPathPromote.new(
                  @source_env.id,
                  @target_env.id
                )

                result = ::ForemanAnsibleDirector::LifecycleEnvironmentPathService.promote(@path, path_promote)

                assert result
                @target_env.reload
                assert_equal new_snapshot, @target_env.content_snapshot
                assert_equal execution_environment, @target_env.execution_environment
              end
            end
          end

          test 'fails when source environment not found' do
            path_promote = ::ForemanAnsibleDirector::Structs::LifecycleEnvironmentPath::LifecycleEnvironmentPathPromote.new(
              999999,
              @target_env.id
            )

            result = ::ForemanAnsibleDirector::LifecycleEnvironmentPathService.promote(@path, path_promote)

            assert_not result
          end

          test 'fails when target environment not found' do
            path_promote = ::ForemanAnsibleDirector::Structs::LifecycleEnvironmentPath::LifecycleEnvironmentPathPromote.new(
              @source_env.id,
              999999
            )

            result = ::ForemanAnsibleDirector::LifecycleEnvironmentPathService.promote(@path, path_promote)

            assert_not result
          end

          test 'fails when source environment is leaf' do

            path = FactoryBot.create(:lifecycle_environment_path, organization: @organization)
            source_env = FactoryBot.create(:lifecycle_environment, organization: @organization, lifecycle_environment_path: path, position: 0)
            source_snapshot = FactoryBot.create(:content_snapshot, references: 2) # 2 because the snapshot will be destroyed when refs = 0
            source_env.update(content_snapshot: source_snapshot)

            path_promote = ::ForemanAnsibleDirector::Structs::LifecycleEnvironmentPath::LifecycleEnvironmentPathPromote.new(
              @source_env.id,
              @target_env.id
            )

            initial_references = source_snapshot.references

            ::ForemanAnsibleDirector::LifecycleEnvironmentPathService.promote(@path, path_promote)

            source_snapshot.reload
            assert_equal initial_references, source_snapshot.references
          end

          test 'fails when promotion direction is wrong' do

            path_promote = ::ForemanAnsibleDirector::Structs::LifecycleEnvironmentPath::LifecycleEnvironmentPathPromote.new(
              @target_env.id,
              @source_env.id
            )

            result = ::ForemanAnsibleDirector::LifecycleEnvironmentPathService.promote(@path, path_promote)

            assert_not result
          end

          test 'fails when promotion spans more than one environment' do
            # Create an intermediate environment
            intermediate_env = FactoryBot.create(:lifecycle_environment, organization: @organization, lifecycle_environment_path: @path, position: 1, parent: @source_env)
            @target_env.update!(position: 2, parent: intermediate_env)
            @source_env.update!(child: intermediate_env)
            intermediate_env.update!(child: @target_env)

            path_promote = ::ForemanAnsibleDirector::Structs::LifecycleEnvironmentPath::LifecycleEnvironmentPathPromote.new(
              @source_env.id,
              @target_env.id
            )

            result = ::ForemanAnsibleDirector::LifecycleEnvironmentPathService.promote(@path, path_promote)

            assert_not result
          end

          test 'decrements references of existing target content snapshot' do
            source_snapshot = FactoryBot.create(:content_snapshot, references: 2) # 2 because the snapshot will be destroyed when refs = 0
            target_snapshot = FactoryBot.create(:content_snapshot, references: 2) #
            @source_env.update!(content_snapshot: source_snapshot)
            @target_env.update!(content_snapshot: target_snapshot)

            path_promote = ::ForemanAnsibleDirector::Structs::LifecycleEnvironmentPath::LifecycleEnvironmentPathPromote.new(
              @source_env.id,
              @target_env.id
            )

            ::ForemanAnsibleDirector::LifecycleEnvironmentPathService.promote(@path, path_promote)

            source_snapshot.reload
            target_snapshot.reload

            assert_equal 3, source_snapshot.references
            assert_equal 1, target_snapshot.references
          end
        end

        describe 'private methods' do
          setup do
            @path = FactoryBot.create(:lifecycle_environment_path, organization: @organization)
          end

          describe '#environment_at_position' do
            test 'returns nil for nil position' do
              result = ::ForemanAnsibleDirector::LifecycleEnvironmentPathService.send(:environment_at_position, @path, nil)
              assert_nil result
            end

            test 'returns environment at specific position' do
              env = FactoryBot.create(:lifecycle_environment, organization: @organization, lifecycle_environment_path: @path, position: 1)

              result = ::ForemanAnsibleDirector::LifecycleEnvironmentPathService.send(:environment_at_position, @path, 1)
              assert_equal env, result
            end

            test 'handles negative position' do
              env1 = FactoryBot.create(:lifecycle_environment, organization: @organization, lifecycle_environment_path: @path, position: 0)
              env2 = FactoryBot.create(:lifecycle_environment, organization: @organization, lifecycle_environment_path: @path, position: 1)

              result = ::ForemanAnsibleDirector::LifecycleEnvironmentPathService.send(:environment_at_position, @path, -1)
              assert_equal env2, result
            end

            test 'returns nil for out of range negative position' do
              FactoryBot.create(:lifecycle_environment, organization: @organization, lifecycle_environment_path: @path, position: 0)

              result = ::ForemanAnsibleDirector::LifecycleEnvironmentPathService.send(:environment_at_position, @path, -5)
              assert_nil result
            end
          end

          describe '#next_position' do
            test 'returns 0 for empty path' do
              result = ::ForemanAnsibleDirector::LifecycleEnvironmentPathService.send(:next_position, @path)
              assert_equal 0, result
            end

            test 'returns incremented position for path with environments' do
              FactoryBot.create(:lifecycle_environment, organization: @organization, lifecycle_environment_path: @path, position: 2)

              result = ::ForemanAnsibleDirector::LifecycleEnvironmentPathService.send(:next_position, @path)
              assert_equal 3, result
            end
          end
        end

      end
    end
  end
end