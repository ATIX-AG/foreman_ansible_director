require 'foreman_ansible_director_test_helper'

module ForemanAnsibleDirectorTests
  module Models
    module Unit
      class ContentUnitTest < ForemanAnsibleDirectorTestCase
        describe 'organization-scoped uniqueness' do
          setup do
            @collection = FactoryBot.create(
              :ansible_collection,
              name: 'operations',
              namespace: 'theforeman',
              organization: @organization
            )
          end

          test 'rejects duplicate collections in the same organization' do
            duplicate = FactoryBot.build(
              :ansible_collection,
              name: @collection.name,
              namespace: @collection.namespace,
              organization: @organization
            )

            assert_not duplicate.valid?
            assert_includes duplicate.errors[:namespace], 'has already been taken'
          end

          test 'allows duplicate collections in different organizations' do
            other_organization = Organization.find_by(name: 'Organization 2')
            duplicate = FactoryBot.build(
              :ansible_collection,
              name: @collection.name,
              namespace: @collection.namespace,
              organization: other_organization
            )

            assert duplicate.valid?
          end

          test 'rejects duplicate roles in the same organization' do
            FactoryBot.create(
              :ansible_role,
              name: 'foreman',
              namespace: 'theforeman',
              organization: @organization
            )

            duplicate = FactoryBot.build(
              :ansible_role,
              name: 'foreman',
              namespace: 'theforeman',
              organization: @organization
            )

            assert_not duplicate.valid?
            assert_includes duplicate.errors[:namespace], 'has already been taken'
          end

          test 'allows a collection and role with the same full name in one organization' do
            role = FactoryBot.build(
              :ansible_role,
              name: @collection.name,
              namespace: @collection.namespace,
              organization: @organization
            )

            assert role.valid?
          end
        end
      end
    end
  end
end
