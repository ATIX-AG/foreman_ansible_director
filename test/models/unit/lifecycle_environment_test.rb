# frozen_string_literal: true

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
        end

        def create_content_unit_version
          collection = FactoryBot.create(:ansible_collection, organization: @organization)
          FactoryBot.create(:content_unit_version, versionable: collection)
        end

        test 'requires a name' do
          @environment.name = nil

          refute @environment.valid?
          assert_includes @environment.errors[:name], "can't be blank"
        end

        test 'requires a non-negative position' do
          @environment.position = -1

          refute @environment.valid?
          assert_includes @environment.errors[:position], 'must be greater than or equal to 0'
        end

        test 'returns direct content unit versions without snapshot content' do
          content_unit_version = create_content_unit_version
          FactoryBot.create(
            :lifecycle_environment_content_unit_version,
            lifecycle_environment: @environment,
            content_unit_version: content_unit_version
          )

          assert_equal [content_unit_version], @environment.content_unit_versions.to_a
          assert_equal [content_unit_version], @environment.cs_content_unit_versions.to_a
        end

        test 'returns snapshot content unit versions when snapshot content is used' do
          direct_version = create_content_unit_version
          snapshot_version = create_content_unit_version
          snapshot = FactoryBot.create(:content_snapshot)

          FactoryBot.create(
            :lifecycle_environment_content_unit_version,
            lifecycle_environment: @environment,
            content_unit_version: direct_version
          )
          FactoryBot.create(
            :content_snapshot_content_unit_version,
            content_snapshot: snapshot,
            content_unit_version: snapshot_version
          )

          @environment.update!(content_snapshot: snapshot)

          assert @environment.using_snapshot_content?
          assert_equal [snapshot_version], @environment.content_unit_versions.to_a
          refute_includes @environment.content_unit_versions.to_a, direct_version
        end

        test 'exposes content source name and execution environment' do
          execution_environment = FactoryBot.create(:execution_environment, organization: @organization)
          @environment.update!(execution_environment: execution_environment)

          assert_equal "#{@path.name} > #{@environment.name}", @environment.cs_name
          assert_equal execution_environment, @environment.cs_execution_environment
        end

        test 'assign_execution_environment assigns existing environment' do
          execution_environment = FactoryBot.create(:execution_environment, organization: @organization)

          assert @environment.assign_execution_environment!(execution_environment.id)
          assert_equal execution_environment.id, @environment.reload.execution_environment_id
        end

        test 'assign_execution_environment returns false for missing environment' do
          refute @environment.assign_execution_environment!(-1)
          assert_includes @environment.errors[:execution_environment_id], 'not found'
          assert_nil @environment.execution_environment_id
        end

        test 'assign_content_unit_version creates assignment' do
          content_unit_version = create_content_unit_version

          @environment.assign_content_unit_version!(content_unit_version)

          assert_equal [content_unit_version], @environment.direct_content_unit_versions.to_a
        end

        test 'assign_content_unit_version rejects duplicate assignment' do
          content_unit_version = create_content_unit_version
          @environment.assign_content_unit_version!(content_unit_version)

          error = assert_raises(ArgumentError) do
            @environment.assign_content_unit_version!(content_unit_version)
          end

          assert_match(/already has ContentUnit/, error.message)
          assert_equal 1, @environment.lifecycle_environment_content_unit_versions.count
        end

        test 'content_hash returns snapshot hash for snapshot content' do
          snapshot = FactoryBot.create(:content_snapshot, content_hash: 'deadbeef')
          @environment.update!(content_snapshot: snapshot)

          assert_equal 'deadbeef', @environment.content_hash
        end

        test 'content_hash changes when execution environment changes' do
          content_unit_version = create_content_unit_version
          execution_environment = FactoryBot.create(:execution_environment, organization: @organization)
          FactoryBot.create(
            :lifecycle_environment_content_unit_version,
            lifecycle_environment: @environment,
            content_unit_version: content_unit_version
          )

          original_hash = @environment.content_hash
          @environment.update!(execution_environment: execution_environment)

          refute_equal original_hash, @environment.content_hash
        end

        test 'root? returns true when there is no parent' do
          assert @environment.root?

          child = FactoryBot.create(
            :lifecycle_environment,
            organization: @organization,
            lifecycle_environment_path: @path,
            parent: @environment
          )

          refute child.root?
        end

        test 'leaf? returns true when there is no child' do
          assert @environment.leaf?

          child = FactoryBot.create(
            :lifecycle_environment,
            organization: @organization,
            lifecycle_environment_path: @path
          )
          @environment.update!(child: child)

          refute @environment.leaf?
        end

        test 'ancestors returns parents from nearest to root' do
          parent = FactoryBot.create(
            :lifecycle_environment,
            organization: @organization,
            lifecycle_environment_path: @path
          )
          child = FactoryBot.create(
            :lifecycle_environment,
            organization: @organization,
            lifecycle_environment_path: @path,
            parent: parent
          )
          grandchild = FactoryBot.create(
            :lifecycle_environment,
            organization: @organization,
            lifecycle_environment_path: @path,
            parent: child
          )

          assert_equal [child, parent], grandchild.ancestors
          assert_empty parent.ancestors
        end
      end
    end
  end
end
