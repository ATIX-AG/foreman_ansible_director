require 'foreman_ansible_director_test_helper'

module ForemanAnsibleDirectorTests
  module Models
    module Unit
      class LifecycleEnvironmentTest < ForemanAnsibleDirectorTestCase
        setup do
          @path = FactoryBot.create(:lifecycle_environment_path, organization: @organization)
          @environment = FactoryBot.create(
            :lifecycle_environment,
            organization: @organization,
            lifecycle_environment_path: @path
          )
          @collection = FactoryBot.create(:ansible_collection, organization: @organization)
          @version = FactoryBot.create(:content_unit_version, versionable: @collection)
        end

        test 'content_unit_versions returns direct content without snapshot' do
          @environment.assign_content_unit_version!(@version)

          assert_equal [@version], @environment.content_unit_versions.to_a
        end

        test 'content_unit_versions returns snapshot content when snapshot is assigned' do
          direct_version = FactoryBot.create(:content_unit_version, versionable: @collection)
          snapshot = FactoryBot.create(:content_snapshot, references: 1)
          FactoryBot.create(
            :content_snapshot_content_unit_version,
            content_snapshot: snapshot,
            content_unit_version: @version
          )
          @environment.assign_content_unit_version!(direct_version)
          @environment.update!(content_snapshot: snapshot)

          assert_equal [@version], @environment.content_unit_versions.to_a
        end

        test 'content_hash returns snapshot content hash when snapshot is assigned' do
          snapshot = FactoryBot.create(:content_snapshot, content_hash: 'snapshot')
          @environment.assign_content_unit_version!(@version)
          @environment.update!(content_snapshot: snapshot)

          assert_equal 'snapshot', @environment.content_hash
        end

        test 'content source methods expose environment details' do
          execution_environment = FactoryBot.create(:execution_environment, organization: @organization)
          @environment.assign_content_unit_version!(@version)
          @environment.update!(execution_environment: execution_environment)

          assert_equal [@version], @environment.cs_content_unit_versions.to_a
          assert_equal "#{@path.name} > #{@environment.name}", @environment.cs_name
          assert_equal execution_environment, @environment.cs_execution_environment
        end

        test 'assign_execution_environment! assigns existing execution environment' do
          execution_environment = FactoryBot.create(:execution_environment, organization: @organization)

          assert @environment.assign_execution_environment!(execution_environment.id)
          assert_equal execution_environment.id, @environment.reload.execution_environment_id
        end

        test 'assign_execution_environment! returns false for missing execution environment' do
          assert_equal false, @environment.assign_execution_environment!(-1)
          assert_includes @environment.errors[:execution_environment_id], 'not found'
        end

        test 'root and leaf reflect linked path position' do
          child = FactoryBot.create(
            :lifecycle_environment,
            organization: @organization,
            lifecycle_environment_path: @path,
            parent: @environment
          )
          @environment.update!(child: child)

          assert @environment.root?
          assert_not @environment.leaf?
          assert_not child.root?
          assert child.leaf?
        end

        test 'ancestors returns parents recursively' do
          child = FactoryBot.create(
            :lifecycle_environment,
            organization: @organization,
            lifecycle_environment_path: @path,
            parent: @environment
          )
          grandchild = FactoryBot.create(
            :lifecycle_environment,
            organization: @organization,
            lifecycle_environment_path: @path,
            parent: child
          )

          assert_equal [child, @environment], grandchild.ancestors
        end
      end
    end
  end
end
