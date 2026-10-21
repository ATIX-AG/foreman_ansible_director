require 'foreman_ansible_director_test_helper'

module ForemanAnsibleDirectorTests
  module Models
    module Unit
      class ContentUnitVersionTest < ForemanAnsibleDirectorTestCase
        setup do
          @collection = FactoryBot.create(:ansible_collection, organization: @organization)
          @role = FactoryBot.create(:ansible_role, organization: @organization)
        end

        test 'content_unit_type returns collection for collection content' do
          collection_version = FactoryBot.create(:content_unit_version, versionable: @collection)

          assert_equal 'collection', collection_version.content_unit_type
        end

        test 'content_unit_type returns role for role content' do
          role_version = FactoryBot.create(:content_unit_version, versionable: @role)

          assert_equal 'role', role_version.content_unit_type
        end

        test 'version must be unique within the same versionable content unit' do
          FactoryBot.create(:content_unit_version, versionable: @collection, version: '1.0.0')
          duplicate = FactoryBot.build(:content_unit_version, versionable: @collection, version: '1.0.0')

          assert_not duplicate.valid?
          assert_includes duplicate.errors[:version], 'has already been taken'
        end

        test 'version is required' do
          version = FactoryBot.build(:content_unit_version, versionable: @collection, version: nil)

          assert_not version.valid?
          assert_includes version.errors[:version], "can't be blank"
        end

        test 'same version is allowed on different content units' do
          FactoryBot.create(:content_unit_version, versionable: @collection, version: '1.0.0')
          role_version = FactoryBot.build(:content_unit_version, versionable: @role, version: '1.0.0')

          assert role_version.valid?
        end
      end
    end
  end
end
