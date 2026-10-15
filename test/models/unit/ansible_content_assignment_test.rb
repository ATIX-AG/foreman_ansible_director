# frozen_string_literal: true

require 'foreman_ansible_director_test_helper'

module ForemanAnsibleDirectorTests
  module Models
    class AnsibleContentAssignmentTest < ForemanAnsibleDirectorTestCase

      describe 'validations' do
        describe 'assignment_unique_for_consumable' do
          setup do
            as_admin do
              @host = FactoryBot.create(:host, organization: @organization)
              @hostgroup = FactoryBot.create(:hostgroup, organizations: [@organization])
            end

            @collection = FactoryBot.create(:ansible_collection, organization: @organization)
            @collection_version = FactoryBot.create(:content_unit_version, :for_collection, versionable: @collection)
            @collection_role = FactoryBot.create(:ansible_collection_role, ansible_collection_version: @collection_version)

            @role = FactoryBot.create(:ansible_role, organization: @organization)
            @role_version = FactoryBot.create(:content_unit_version, :for_role, versionable: @role)
          end

          test 'rejects duplicate AnsibleCollectionRole assignments to same consumable' do
            FactoryBot.create(
              :ansible_content_assignment,
              consumable: @host,
              assignable_type: 'ForemanAnsibleDirector::AnsibleCollectionRole',
              assignable_namespace: @collection_version.versionable.namespace,
              assignable_name: @collection_version.versionable.name,
              assignable_role_name: @collection_role.name
            )

            duplicate = FactoryBot.build(
              :ansible_content_assignment,
              consumable: @host,
              assignable_type: 'ForemanAnsibleDirector::AnsibleCollectionRole',
              assignable_namespace: @collection_version.versionable.namespace,
              assignable_name: @collection_version.versionable.name,
              assignable_role_name: @collection_role.name
            )

            assert_not duplicate.valid?
            assert duplicate.errors.key?(:uniqueness_per_consumable)
            assert_includes duplicate.errors[:uniqueness_per_consumable],
              "#{@collection_version.versionable.namespace}.#{@collection_version.versionable.name}.#{@collection_role.name} is already assigned to #{@host.name}."
          end

          test 'rejects duplicate AnsibleRole assignments to same consumable' do
            FactoryBot.create(
              :ansible_content_assignment,
              :for_role,
              consumable: @host,
              assignable_type: 'ForemanAnsibleDirector::AnsibleRole',
              assignable_namespace: @role.namespace,
              assignable_name: @role.name,
              assignable_role_name: nil
            )

            duplicate = FactoryBot.build(
              :ansible_content_assignment,
              :for_role,
              consumable: @host,
              assignable_type: 'ForemanAnsibleDirector::AnsibleRole',
              assignable_namespace: @role.namespace,
              assignable_name: @role.name,
              assignable_role_name: nil
            )

            assert_not duplicate.valid?
            assert duplicate.errors.key?(:uniqueness_per_consumable)
            assert_includes duplicate.errors[:uniqueness_per_consumable],
              "#{@role.namespace}.#{@role.name} is already assigned to #{@host.name}."
          end

          test 'allows same assignment to different consumables' do
            other_host = FactoryBot.create(:host, organization: @organization)

            FactoryBot.create(
              :ansible_content_assignment,
              consumable: @host,
              assignable_type: 'ForemanAnsibleDirector::AnsibleCollectionRole',
              assignable_namespace: @collection_version.versionable.namespace,
              assignable_name: @collection_version.versionable.name,
              assignable_role_name: @collection_role.name
            )

            other_assignment = FactoryBot.build(
              :ansible_content_assignment,
              consumable: other_host,
              assignable_type: 'ForemanAnsibleDirector::AnsibleCollectionRole',
              assignable_namespace: @collection_version.versionable.namespace,
              assignable_name: @collection_version.versionable.name,
              assignable_role_name: @collection_role.name
            )

            assert other_assignment.valid?
          end

          test 'allows different roles to be assigned to same consumable' do
            FactoryBot.create(
              :ansible_content_assignment,
              consumable: @host,
              assignable_type: 'ForemanAnsibleDirector::AnsibleCollectionRole',
              assignable_namespace: @collection_version.versionable.namespace,
              assignable_name: @collection_version.versionable.name,
              assignable_role_name: @collection_role.name
            )

            second_collection = FactoryBot.create(:ansible_collection, organization: @organization)
            second_version = FactoryBot.create(:content_unit_version, :for_collection, versionable: second_collection)
            second_role = FactoryBot.create(:ansible_collection_role, ansible_collection_version: second_version)

            second_assignment = FactoryBot.build(
              :ansible_content_assignment,
              consumable: @host,
              assignable_type: 'ForemanAnsibleDirector::AnsibleCollectionRole',
              assignable_namespace: second_version.versionable.namespace,
              assignable_name: second_version.versionable.name,
              assignable_role_name: second_role.name
            )

            assert second_assignment.valid?
          end
        end
      end
    end
  end
end
