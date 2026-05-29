require 'foreman_ansible_director_test_helper'

module ForemanAnsibleDirectorTests
  module Models
    class AnsibleVariableTest < ForemanAnsibleDirectorTestCase
      describe '#default_value=' do
        setup do
          @collection = FactoryBot.create(:ansible_collection, organization: @organization)
          @collection_version = FactoryBot.create(:content_unit_version, :for_collection, versionable: @collection)
          @collection_role = FactoryBot.create(:ansible_collection_role, ansible_collection_version: @collection_version)
          as_admin do
            @ansible_variable = FactoryBot.create(:ansible_variable, :for_collection_role, ownable: @collection_role)
          end
        end

        test 'converts ActiveSupport::HashWithIndifferentAccess to regular hash' do
          hash_wia = ActiveSupport::HashWithIndifferentAccess.new({ 'key' => 'value' })
          @ansible_variable.update(default_value: hash_wia)

          assert_kind_of Hash, @ansible_variable.default_value
          refute_kind_of ActiveSupport::HashWithIndifferentAccess, @ansible_variable.default_value
          assert_equal({ 'key' => 'value' }, @ansible_variable.default_value)
        end

        test 'converts nested ActiveSupport::HashWithIndifferentAccess hashes to regular hashes' do
          inner_wia = ActiveSupport::HashWithIndifferentAccess.new(x: 1)
          outer_wia = ActiveSupport::HashWithIndifferentAccess.new(inner: inner_wia, outer: true)
          @ansible_variable.update(default_value: outer_wia)

          result = @ansible_variable.default_value
          assert_instance_of Hash, result
          assert_equal({ 'inner' => { 'x' => 1 }, 'outer' => true }, result)
        end
      end
    end
  end
end
