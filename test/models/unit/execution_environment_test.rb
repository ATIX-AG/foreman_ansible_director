require 'foreman_ansible_director_test_helper'

module ForemanAnsibleDirectorTests
  module Models
    module Unit
      class ExecutionEnvironmentTest < ForemanAnsibleDirectorTestCase

        def described_class
          ::ForemanAnsibleDirector::ExecutionEnvironment
        end

        setup do
          @execution_environment = FactoryBot.create(:execution_environment, organization: @organization)
          @collection = FactoryBot.create(:ansible_collection, organization: @organization)
          @version = FactoryBot.create(:content_unit_version, versionable: @collection, version: '1.0.0')
        end

        describe '#name' do
          test 'must not be empty' do
            ee = described_class.create
            assert_not ee.valid?
            assert_includes ee.errors[:name], 'Execution Environment name cannot be blank.'
          end

          test 'must not exceed 255 characters' do
            ee = described_class.create(
              name: "A" * 256,
            )
            assert_not ee.valid?
            assert_includes ee.errors[:name], 'is too long (maximum is 255 characters)'
          end
        end

        describe '#base_image_url' do
          test 'must not be empty' do
            ee = described_class.create(
                name: "MyEE",
              )
            assert_not ee.valid?
            assert_includes ee.errors[:base_image_url], 'Execution Environment base image URL cannot be blank.'
          end

          test 'must not exceed 255 characters' do
            ee = described_class.create(
                name: "MyEE",
                base_image_url: "A" * 256,
              )
            assert_not ee.valid?
            assert_includes ee.errors[:base_image_url], 'is too long (maximum is 255 characters)'
          end
        end

        describe '#ansible_version' do
          test 'must not be empty' do
            ee = described_class.create(
              name: "MyEE",
              base_image_url: "https://quay.io/fedora/fedora:42"
            )
            assert_not ee.valid?
            assert_includes ee.errors[:ansible_version], 'Ansible Version cannot be blank.'
          end
        end

        describe '#dependents' do
          test 'deletes associated ExecutionEnvironmentContentUnits on deletion' do
            assignment = @execution_environment.add_content_unit(@collection, @version)
            @execution_environment.destroy

            refute ::ForemanAnsibleDirector::ExecutionEnvironmentContentUnit.find_by(id: assignment.id)
            refute ::ForemanAnsibleDirector::ExecutionEnvironment.find_by(id: @execution_environment.id)
          end

          test 'nullifies execution_environment_id of LifecycleEnvironment' do
            @lce_path = FactoryBot.create(:lifecycle_environment_path, organization: @organization)
            @lce = FactoryBot.create(:lifecycle_environment, lifecycle_environment_path: @lce_path, organization: @organization, execution_environment: @execution_environment)

            assert_equal @execution_environment.id, @lce.execution_environment_id

            @execution_environment.destroy
            @lce.reload

            refute ::ForemanAnsibleDirector::ExecutionEnvironment.find_by(id: @execution_environment.id)
            refute @lce.execution_environment
          end
        end

        describe '#registry_url' do
          test 'returns local registry path for execution environment' do
            expected = "localhost/ansible_director/#{@execution_environment.id}:latest"
            assert_equal expected, @execution_environment.registry_url
          end
        end

        describe '#generate_content_hash' do
          test 'changes when content changes' do
            original_hash = @execution_environment.generate_content_hash

            @execution_environment.add_content_unit(@collection, @version)

            assert_not_equal original_hash, @execution_environment.generate_content_hash
          end

          test 'changes when ansible version changes' do
            original_hash = @execution_environment.generate_content_hash

            @execution_environment.ansible_version = '2.19.0'
            @execution_environment.save!

            assert_not_equal original_hash, @execution_environment.generate_content_hash
          end

          test 'changes when base image changes' do
            original_hash = @execution_environment.generate_content_hash

            @execution_environment.base_image_url = 'quay.io/ansible/other-ee:latest'
            @execution_environment.save!

            assert_not_equal original_hash, @execution_environment.generate_content_hash
          end

          test 'is deterministic' do
            @collection2 = FactoryBot.create(:ansible_collection, organization: @organization)
            @version2 = FactoryBot.create(:content_unit_version, versionable: @collection2, version: '1.0.0')

            original_base_image_url = @execution_environment.base_image_url
            original_ansible_version = @execution_environment.ansible_version
            assignment_1 = @execution_environment.add_content_unit(@collection, @version)
            @execution_environment.add_content_unit(@collection2, @version2)

            original_hash = @execution_environment.generate_content_hash

            @execution_environment.base_image_url = 'quay.io/ansible/other-ee:latest'
            @execution_environment.ansible_version = 'MyEE'
            @execution_environment.save!
            assignment_1.destroy!


            assert_not_equal original_hash, @execution_environment.generate_content_hash

            @execution_environment.base_image_url = original_base_image_url
            @execution_environment.ansible_version = original_ansible_version
            @execution_environment.save!
            @execution_environment.add_content_unit(@collection, @version)

            assert_equal original_hash, @execution_environment.generate_content_hash
          end

          test 'is stable with respect to content assignment order' do
            @collection1 = @collection
            @version1 = @version
            @collection2 = FactoryBot.create(:ansible_collection, organization: @organization)
            @version2 = FactoryBot.create(:content_unit_version, versionable: @collection2, version: '1.0.0')
            @collection3 = FactoryBot.create(:ansible_collection, organization: @organization)
            @version3 = FactoryBot.create(:content_unit_version, versionable: @collection3, version: '1.0.0')

            # Order: 1 - 2 - 3
            assignment_1 = @execution_environment.add_content_unit(@collection1, @version1)
            assignment_2 = @execution_environment.add_content_unit(@collection2, @version2)
            assignment_3 = @execution_environment.add_content_unit(@collection3, @version3)

            original_hash = @execution_environment.generate_content_hash

            assignment_1.destroy
            assignment_2.destroy
            assignment_3.destroy

            assert_not_equal original_hash, @execution_environment.generate_content_hash

            # Order: 3 - 1 - 2
            @execution_environment.add_content_unit(@collection3, @version3)
            @execution_environment.add_content_unit(@collection1, @version1)
            @execution_environment.add_content_unit(@collection2, @version2)

            assert_equal original_hash, @execution_environment.generate_content_hash
          end
        end

        describe '#rebuild_necessary?' do
          test 'tracks content hash changes' do
            @execution_environment.update!(content_hash: 'abcd1234')

            assert @execution_environment.rebuild_necessary?
          end

          test 'returns "false" if non-relevant attributes were updated' do
            @execution_environment.update!(name: "MyAwesomeNewName")

            refute @execution_environment.rebuild_necessary?
          end
        end

        describe '#add_content_unit' do
          test 'creates execution environment content unit' do
            assignment = @execution_environment.add_content_unit(@collection, @version)

            assert_equal @execution_environment, assignment.execution_environment
            assert_equal @collection, assignment.content_unit
            assert_equal @version, assignment.content_unit_version
          end

          test 'does not create duplicate assignments' do
            first_assignment = @execution_environment.add_content_unit(@collection, @version)
            second_assignment = @execution_environment.add_content_unit(@collection, @version)

            assert_equal first_assignment, second_assignment
            assert_equal 1, @execution_environment.execution_environment_content_units.count
          end
        end
      end
    end
  end
end
