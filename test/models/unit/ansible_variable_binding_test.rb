# frozen_string_literal: true

require 'foreman_ansible_director_test_helper'

module ForemanAnsibleDirectorTests
  module Models
    class AnsibleVariableBindingTest < ForemanAnsibleDirectorTestCase

      describe '#render_for_api' do
        setup do
          @host = FactoryBot.create(:host, organization: @organization)
          @binding = FactoryBot.create(:ansible_variable_binding, organization: @organization, consumable: @host)
        end

        test 'returns a hash with expected keys' do
          result = @binding.render_for_api

          assert_instance_of Hash, result
          assert_equal @binding.id, result[:id]
          assert_equal @binding.variable_name, result[:variable_name]
          assert_equal @binding.data_type, result[:data_type]
          assert_equal @binding.raw_value, result[:raw_value]
          assert_equal 'local', result[:query]
          assert_equal 'static', result[:transformer]
          assert_equal @binding.value, result[:parsed_value]
        end

        test 'maps consumable type Host::Managed to Host' do
          @host.update!(type: 'Host::Managed')

          result = @binding.render_for_api

          assert_equal 'Host', result[:consumable_type]
        end

        test 'maps consumable type Host::Base to Host' do
          @host.update!(type: 'Host::Base')

          result = @binding.render_for_api

          assert_equal 'Host', result[:consumable_type]
        end

        test 'uses title attribute for host group consumables' do
          as_admin do
            hostgroup = FactoryBot.create(:hostgroup, organizations: [@organization])
            nested_hostgroup = FactoryBot.create(:hostgroup, organizations: [@organization])

            nested_hostgroup.update(parent: hostgroup)
            nested_hostgroup.reload

            binding = FactoryBot.create(:ansible_variable_binding, organization: @organization, consumable: nested_hostgroup)

            result = binding.render_for_api

            assert_equal nested_hostgroup.title, result[:consumable_name]
          end
        end

        test 'uses name attribute for host consumables' do
          @host.update!(name: 'host-test-name')
          result = @binding.render_for_api

          assert_equal 'host-test-name', result[:consumable_name]
        end

        test 'includes assignable attributes' do
          result = @binding.render_for_api

          assert_equal 'ForemanAnsibleDirector::AnsibleCollectionRole', result[:assignable_type]
          assert_equal 'test_namespace', result[:assignable_namespace]
          assert_equal 'test_role_name', result[:assignable_name]
        end

        describe 'assignable_role_name for AnsibleCollectionRole' do
          setup do
            @collection = FactoryBot.create(:ansible_collection, organization: @organization)
            @collection_version = FactoryBot.create(:content_unit_version, :for_collection, versionable: @collection)
            @collection_role = FactoryBot.create(:ansible_collection_role, ansible_collection_version: @collection_version)

            @binding = FactoryBot.create(
              :ansible_variable_binding,
              organization: @organization,
              consumable: @host,
              assignable_type: 'ForemanAnsibleDirector::AnsibleCollectionRole',
              assignable_namespace: @collection_version.versionable.namespace,
              assignable_name: @collection_version.versionable.name,
              assignable_role_name: 'specific_role'
            )
          end

          test 'includes assignable_role_name for AnsibleCollectionRole' do
            result = @binding.render_for_api

            assert_equal 'specific_role', result[:assignable_role_name]
          end
        end

        describe 'assignable_role_name for AnsibleRole' do
          setup do
            @role = FactoryBot.create(:ansible_role, organization: @organization)

            @binding = FactoryBot.create(
              :ansible_variable_binding,
              :for_ansible_role,
              organization: @organization,
              consumable: @host,
              assignable_type: 'ForemanAnsibleDirector::AnsibleRole',
              assignable_namespace: @role.namespace,
              assignable_name: @role.name,
              assignable_role_name: nil
            )
          end

          test 'omits assignable_role_name for AnsibleRole' do
            result = @binding.render_for_api

            assert_not_includes result.keys, :assignable_role_name
          end
        end

        test 'includes consumable_id' do
          result = @binding.render_for_api

          assert_equal @host.id, result[:consumable_id]
        end

        describe 'with different data types' do
          test 'parses integer data type' do
            binding = FactoryBot.create(
              :ansible_variable_binding,
              :with_integer_type,
              organization: @organization,
              consumable: @host
            )

            result = binding.render_for_api
            assert_equal 42, result[:parsed_value]
          end

          test 'parses boolean data type' do
            binding = FactoryBot.create(
              :ansible_variable_binding,
              :with_boolean_type,
              organization: @organization,
              consumable: @host
            )

            result = binding.render_for_api
            assert_equal true, result[:parsed_value]
          end

          test 'parses dictionary data type' do
            binding = FactoryBot.create(
              :ansible_variable_binding,
              :with_dict_type,
              organization: @organization,
              consumable: @host
            )

            result = binding.render_for_api
            assert_instance_of Hash, result[:parsed_value]
          end

          test 'parses array data type' do
            binding = FactoryBot.create(
              :ansible_variable_binding,
              :with_array_type,
              organization: @organization,
              consumable: @host
            )

            result = binding.render_for_api
            assert_instance_of Array, result[:parsed_value]
          end
        end
      end

      describe 'validations' do
        setup do
          @organization = FactoryBot.create(:organization)
          @host = FactoryBot.create(:host, organization: @organization)
        end

        test 'validates uniqueness of variable_name scoped to consumable' do
          as_admin do
            FactoryBot.create(
              :ansible_variable_binding,
              variable_name: 'my_var',
              organization: @organization,
              consumable: @host
            )
          end

          duplicate = FactoryBot.build(
            :ansible_variable_binding,
            variable_name: 'my_var',
            organization: @organization,
            consumable: @host
          )

          assert_not duplicate.valid?
          assert_includes duplicate.errors[:variable_name],
            'A binding of this variable to the provided node already exists.'
        end

        test 'allows same variable_name for different consumables' do
          other_host = FactoryBot.create(:host, organization: @organization)

          as_admin do
            FactoryBot.create(
              :ansible_variable_binding,
              variable_name: 'my_var',
              organization: @organization,
              consumable: @host
            )
          end

          other_binding = FactoryBot.create(
            :ansible_variable_binding,
            variable_name: 'my_var',
            organization: @organization,
            consumable: other_host
          )

          assert other_binding.valid?
        end
      end

      describe 'associations' do
        setup do
          @host = FactoryBot.create(:host, organization: @organization)
        end

        test 'belongs_to organization' do
          binding = FactoryBot.create(:ansible_variable_binding, organization: @organization)

          assert_equal @organization, binding.organization
        end

        test 'belongs_to consumable polymorphically' do
          binding = FactoryBot.create(:ansible_variable_binding, organization: @organization, consumable: @host)

          assert_equal @host, binding.consumable
          assert_instance_of ::Host::Managed, binding.consumable
        end
      end
    end
  end
end
