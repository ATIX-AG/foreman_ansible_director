require 'foreman_ansible_director_test_helper'

module ForemanAnsibleDirectorTests
  module Services
    module Unit
      class ContentServiceTest < ForemanAnsibleDirectorTestCase

        describe '#create_ansible_collection' do
          test 'creates AnsibleCollection record' do
            collection = ::ForemanAnsibleDirector::ContentService.create_ansible_collection(
              name: 'operations',
              namespace: 'theforeman',
              organization_id: @organization.id
            )

            assert_equal 'operations', collection.name
            assert_equal 'theforeman', collection.namespace
            assert_equal @organization.id, collection.organization_id
            assert collection.collection?
          end
        end

        describe '#create_ansible_role' do
          test 'creates AnsibleRole record' do
            role = ::ForemanAnsibleDirector::ContentService.create_ansible_role(
              name: 'foreman',
              namespace: 'theforeman',
              organization_id: @organization.id
            )

            assert_equal 'foreman', role.name
            assert_equal 'theforeman', role.namespace
            assert_equal @organization.id, role.organization_id
            assert role.role?
          end
        end

        describe '#create_ansible_content_unit_version' do
          test 'creates ContentUnitVersion record' do
            collection = FactoryBot.create(:ansible_collection, organization: @organization)

            version = ::ForemanAnsibleDirector::ContentService.create_ansible_content_unit_version(
              versionable: collection,
              source: 'https://galaxy.example.com',
              source_type: 'galaxy',
              latest_version_href: '/pulp/api/v3/repositories/1/versions/1/',
              pulp_repository_href: '/pulp/api/v3/repositories/1/',
              pulp_remote_href: '/pulp/api/v3/remotes/1/',
              pulp_distribution_href: '/pulp/api/v3/distributions/1/',
              version: '1.2.3',
              dynamic: false
            )

            assert_equal collection, version.versionable
            assert_equal 'https://galaxy.example.com', version.source
            assert_equal 'galaxy', version.source_type
            assert_equal '/pulp/api/v3/repositories/1/versions/1/', version.latest_version_href
            assert_equal '/pulp/api/v3/repositories/1/', version.pulp_repository_href
            assert_equal '/pulp/api/v3/remotes/1/', version.pulp_remote_href
            assert_equal '/pulp/api/v3/distributions/1/', version.pulp_distribution_href
            assert_equal '1.2.3', version.version
            assert_not version.dynamic
          end
        end

        describe '#create_content_unit_revision' do
          test 'creates ContentUnitRevision record' do
            collection = FactoryBot.create(:ansible_collection, organization: @organization)
            content_version = FactoryBot.create(:content_unit_version, versionable: collection)

            revision = ::ForemanAnsibleDirector::ContentService.create_content_unit_revision(
              cuv_id: content_version.id,
              git_ref: 'main',
              latest_version_href: '/pulp/api/v3/repositories/1/versions/1/',
              pulp_repository_href: '/pulp/api/v3/repositories/1/',
              pulp_remote_href: '/pulp/api/v3/remotes/1/',
              pulp_distribution_href: '/pulp/api/v3/distributions/1/'
            )

            assert_equal content_version, revision.content_unit_version
            assert_equal 'main', revision.git_ref
            assert_equal '/pulp/api/v3/repositories/1/versions/1/', revision.latest_version_href
          end
        end

        describe '#create_collection_role' do
          test 'creates AnsibleCollectionRole record for ContentUnitVersion' do
            collection = FactoryBot.create(:ansible_collection, organization: @organization)
            content_version = FactoryBot.create(:content_unit_version, :for_collection, versionable: collection)

            role = ::ForemanAnsibleDirector::ContentService.create_collection_role(
              collection: content_version,
              name: 'server'
            )

            assert_equal 'server', role.name
            assert_equal content_version, role.ansible_collection_version
          end
        end

        describe '#create_collection_role_for_revision' do
          test 'creates AnsibleCollectionRole record for ContentUnitRevision' do
            collection = FactoryBot.create(:ansible_collection, organization: @organization)
            content_version = FactoryBot.create(
              :content_unit_version,
              versionable: collection,
              source_type: 'git',
              dynamic: true
            )
            revision = ::ForemanAnsibleDirector::ContentUnitRevision.create!(
              content_unit_version: content_version,
              git_ref: 'main'
            )

            role = ::ForemanAnsibleDirector::ContentService.create_collection_role_for_revision(
              revision: revision,
              name: 'server'
            )

            assert_equal 'server', role.name
            assert_equal revision, role.content_unit_revision
          end
        end

        describe '#create_revision_activator' do
          test 'creates ActiveRevision record' do
            collection = FactoryBot.create(:ansible_collection, organization: @organization)
            content_version = FactoryBot.create(
              :content_unit_version,
              versionable: collection,
              source_type: 'git',
              dynamic: true
            )
            revision = ::ForemanAnsibleDirector::ContentUnitRevision.create!(
              content_unit_version: content_version,
              git_ref: 'main'
            )
            execution_environment = FactoryBot.create(:execution_environment, organization: @organization)

            active_revision = ::ForemanAnsibleDirector::ContentService.create_revision_activator(
              consumable_type: execution_environment.class.name,
              consumable_id: execution_environment.id,
              revision_id: revision.id
            )

            assert_equal execution_environment, active_revision.consumable
            assert_equal revision, active_revision.content_unit_revision
          end
        end

        describe '#resolve_import_payload' do
          test 'resolves a single collection unit' do
            result = ::ForemanAnsibleDirector::ContentService.resolve_import_payload(
              [
                {
                  unit_type: 'collection',
                  unit_name: 'my_namespace.my_collection',
                  unit_source_type: 'galaxy',
                  unit_source: 'https://galaxy.ansible.com/',
                  unit_versions: %w[1.0.0 2.0.0]
                }
              ]
            )

            assert_equal 1, result.length
            unit = result.first
            assert_equal :collection, unit.unit_type
            assert_equal 'https://galaxy.ansible.com/', unit.source
            assert_equal 'my_namespace.my_collection', unit.name
            assert_equal %w[1.0.0 2.0.0], unit.versions
          end

          test 'parses a role unit' do
            result = ::ForemanAnsibleDirector::ContentService.resolve_import_payload(
              [
                {
                  unit_type: 'role',
                  unit_name: 'my_namespace.my_role',
                  unit_source_type: 'galaxy',
                  unit_source: 'https://galaxy.ansible.com',
                  unit_versions: ['1.0.0']
                }
              ]
            )

            assert_equal 1, result.length
            assert_equal :role, result.first.unit_type
          end

          test 'deduplicates units by name and source' do
            result = ::ForemanAnsibleDirector::ContentService.resolve_import_payload(
              [
                {
                  unit_type: 'collection',
                  unit_name: 'ns.coll',
                  unit_source_type: 'galaxy',
                  unit_source: 'https://galaxy.ansible.com',
                  unit_versions: ['1.0.0']
                },
                {
                  unit_type: 'collection',
                  unit_name: 'ns.coll',
                  unit_source_type: 'galaxy',
                  unit_source: 'https://galaxy.ansible.com',
                  unit_versions: ['2.0.0']
                },
              ]
            )

            assert_equal 1, result.length
            assert_equal %w[1.0.0 2.0.0], result.first.versions
          end

          test 'defaults to galaxy source when not provided' do
            result = ::ForemanAnsibleDirector::ContentService.resolve_import_payload(
              [
                {
                  unit_type: 'collection',
                  unit_name: 'ns.coll',
                  unit_source_type: 'galaxy',
                  unit_versions: ['1.0.0']
                }
              ]
            )

            assert_equal 'https://galaxy.ansible.com/', result.first.source
          end

          test 'skips version validation for git source type' do
            result = ::ForemanAnsibleDirector::ContentService.resolve_import_payload(
              [
                {
                  unit_type: 'role',
                  unit_name: 'ns.role',
                  unit_source_type: 'git',
                  unit_source: 'https://github.com/example/repo.git',
                  unit_versions: %w[main develop]
                }
              ]
            )

            assert_equal :git, result.first.source_type
            assert_equal %w[main develop], result.first.versions
          end

          test 'raises ArgumentError for invalid unit name' do
            assert_raises(ArgumentError) do
              ::ForemanAnsibleDirector::ContentService.resolve_import_payload(
                [
                  {
                    unit_type: 'collection',
                    unit_name: 'invalid_name',
                    unit_source_type: 'galaxy',
                    unit_versions: ['1.0.0']
                  }
                ]
              )
            end
          end

          test 'raises ArgumentError for invalid unit type' do
            assert_raises(ArgumentError) do
              ::ForemanAnsibleDirector::ContentService.resolve_import_payload(
                [
                  {
                    unit_type: 'module',
                    unit_name: 'ns.coll',
                    unit_source_type: 'galaxy',
                    unit_versions: ['1.0.0']
                  }
                ]
              )
            end
          end

          test 'raises ArgumentError for invalid unit source type' do
            assert_raises(ArgumentError) do
              ::ForemanAnsibleDirector::ContentService.resolve_import_payload(
                [
                  {
                    unit_type: 'collection',
                    unit_name: 'ns.coll',
                    unit_source_type: 'pulp',
                    unit_versions: ['1.0.0']
                  }
                ]
              )
            end
          end

          test 'raises ArgumentError for invalid version format' do
            assert_raises(ArgumentError) do
              ::ForemanAnsibleDirector::ContentService.resolve_import_payload(
                [
                  {
                    unit_type: 'collection',
                    unit_name: 'ns.coll',
                    unit_source_type: 'galaxy',
                    unit_versions: ['1.0']
                  }
                ]
              )
            end
          end
        end

        describe '#resolve_destroy_payload' do
          setup do
            @collection = FactoryBot.create(:ansible_collection, organization: @organization)
            @content_version = FactoryBot.create(:content_unit_version, versionable: @collection, source_type: 'galaxy')
            @content_version2 = FactoryBot.create(:content_unit_version, versionable: @collection, source_type: 'git')
          end

          test 'returns version IDs for deletion when no references exist' do
            payload = [
              {
                unit_id: @collection.id,
                unit_version_ids: [@content_version.id]
              }
            ]

            result = ::ForemanAnsibleDirector::ContentService.resolve_destroy_payload(payload)

            assert_equal 1, result.length
            assert_equal [@content_version.id], result[@collection.id][:versions][:galaxy]
            assert_equal false, result[@collection.id][:complete]
          end

          test 'returns complete: true when all versions are requested for deletion' do
            payload = [
              {
                unit_id: @collection.id,
                unit_version_ids: [@content_version.id, @content_version2.id]
              }
            ]

            result = ::ForemanAnsibleDirector::ContentService.resolve_destroy_payload(payload)

            assert_equal true, result[@collection.id][:complete]
          end

          test 'returns complete: true when no unit_version_ids given' do
            payload = [{ unit_id: @collection.id }]

            result = ::ForemanAnsibleDirector::ContentService.resolve_destroy_payload(payload)

            assert_equal true, result[@collection.id][:complete]
          end

          test 'raises RecordNotFound for missing content unit' do
            payload = [{ unit_id: 999_999 }]

            assert_raises(ActiveRecord::RecordNotFound) do
              ::ForemanAnsibleDirector::ContentService.resolve_destroy_payload(payload)
            end
          end

          test 'raises RecordNotFound for missing version' do
            payload = [
              {
                unit_id: @collection.id,
                unit_version_ids: [999_999]
              }
            ]

            assert_raises(ActiveRecord::RecordNotFound) do
              ::ForemanAnsibleDirector::ContentService.resolve_destroy_payload(payload)
            end
          end

          test 'adds error and raises CriticalErrorException when CUv is still referenced' do
            path = FactoryBot.create(
              :lifecycle_environment_path,
              organization: @organization
            )
            lce = FactoryBot.create(
              :lifecycle_environment,
              organization: @collection.organization,
              lifecycle_environment_path: path
            )
            FactoryBot.create(
              :lifecycle_environment_content_unit_version,
              lifecycle_environment: lce,
              content_unit_version: @content_version
            )

            payload = [
              { unit_id: @collection.id,
                unit_version_ids: [@content_version.id]
              }
            ]

            assert_raises(::ForemanAnsibleDirector::Issues::CriticalErrorException) do
              ::ForemanAnsibleDirector::ContentService.resolve_destroy_payload(payload)
            end

            assert_equal 1, ctx.errors.length
            assert_instance_of(::ForemanAnsibleDirector::Issues::Errors::CuvStillReferencedError, ctx.errors.first)
          end
        end
      end
    end
  end
end
