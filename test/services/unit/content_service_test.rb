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
      end
    end
  end
end
