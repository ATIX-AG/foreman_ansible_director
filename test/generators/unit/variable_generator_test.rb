# frozen_string_literal: true

require 'foreman_ansible_director_test_helper'

module ForemanAnsibleDirectorTests
  module Generators
    module Unit
      class VariableGeneratorTest < ForemanAnsibleDirectorTestCase

        describe '#generate' do
          test 'returns empty hash when given empty array' do
            result = ForemanAnsibleDirector::Generators::VariableGenerator.generate(
              resolved_host_variables: []
            )

            assert_equal({}, result)
          end

          test 'generates YAML for a single collection role with one variable' do
            resolved = [
              {
                assignment: {
                  assignable_type: 'ForemanAnsibleDirector::AnsibleCollectionRole',
                  assignable_namespace: 'my_namespace',
                  assignable_name: 'my_collection',
                  assignable_role_name: 'my_role',
                },
                variables: [
                  {
                    name: 'my_var',
                    data_type: 'string',
                    raw_value: '--- default_value',
                    binding: nil,
                  },
                ],
              },
            ]

            result = ForemanAnsibleDirector::Generators::VariableGenerator.generate(
              resolved_host_variables: resolved
            )

            assert_equal 1, result.length
            assert_includes result.keys, 'my_namespace.my_collection.my_role_vars.yaml'

            decoded = Base64.decode64(result['my_namespace.my_collection.my_role_vars.yaml'])
            parsed = YAML.safe_load(decoded)
            assert_equal({'my_var' => 'default_value'}, parsed)
          end

          test 'uses binding raw_value when binding exists' do
            resolved = [
              {
                assignment: {
                  assignable_type: 'ForemanAnsibleDirector::AnsibleCollectionRole',
                  assignable_namespace: 'my_namespace',
                  assignable_name: 'my_collection',
                  assignable_role_name: 'my_role',
                },
                variables: [
                  {
                    name: 'my_var',
                    data_type: 'string',
                    raw_value: '--- default_value',
                    binding: {
                      raw_value: '--- overridden_value',
                    },
                  },
                ],
              },
            ]

            result = ForemanAnsibleDirector::Generators::VariableGenerator.generate(
              resolved_host_variables: resolved
            )

            decoded = Base64.decode64(result['my_namespace.my_collection.my_role_vars.yaml'])
            parsed = YAML.safe_load(decoded)
            assert_equal({'my_var' => 'overridden_value'}, parsed)
          end

          test 'generates YAML with multiple variables' do
            resolved = [
              {
                assignment: {
                  assignable_type: 'ForemanAnsibleDirector::AnsibleCollectionRole',
                  assignable_namespace: 'ns',
                  assignable_name: 'coll',
                  assignable_role_name: 'role',
                },
                variables: [
                  {
                    name: 'var_one',
                    data_type: 'string',
                    raw_value: '--- value1',
                    binding: nil,
                  },
                  {
                    name: 'var_two',
                    data_type: 'integer',
                    raw_value: "---\n42",
                    binding: nil,
                  },
                  {
                    name: 'var_three',
                    data_type: 'boolean',
                    raw_value: "---\ntrue",
                    binding: {
                      raw_value: "---\nfalse",
                    },
                  },
                ],
              },
            ]

            result = ForemanAnsibleDirector::Generators::VariableGenerator.generate(
              resolved_host_variables: resolved
            )

            decoded = Base64.decode64(result['ns.coll.role_vars.yaml'])
            parsed = YAML.safe_load(decoded)

            assert_equal 'value1', parsed['var_one']
            assert_equal 42, parsed['var_two']
            assert_equal false, parsed['var_three']
          end

          test 'handles dictionary and array data types' do
            resolved = [
              {
                assignment: {
                  assignable_type: 'ForemanAnsibleDirector::AnsibleCollectionRole',
                  assignable_namespace: 'ns',
                  assignable_name: 'coll',
                  assignable_role_name: 'role',
                },
                variables: [
                  {
                    name: 'dict_var',
                    data_type: 'dictionary',
                    raw_value: "---\nkey1: value1\nkey2: value2",
                    binding: nil,
                  },
                  {
                    name: 'array_var',
                    data_type: 'array',
                    raw_value: "---\n- item1\n- item2\n- item3",
                    binding: nil,
                  },
                ],
              },
            ]

            result = ForemanAnsibleDirector::Generators::VariableGenerator.generate(
              resolved_host_variables: resolved
            )

            decoded = Base64.decode64(result['ns.coll.role_vars.yaml'])
            parsed = YAML.safe_load(decoded)

            assert_instance_of Hash, parsed['dict_var']
            assert_equal({ 'key1' => 'value1', 'key2' => 'value2' }, parsed['dict_var'])
            assert_instance_of Array, parsed['array_var']
            assert_equal(['item1', 'item2', 'item3'], parsed['array_var'])
          end

          test 'generates separate keys for multiple assignments' do
            resolved = [
              {
                assignment: {
                  assignable_type: 'ForemanAnsibleDirector::AnsibleCollectionRole',
                  assignable_namespace: 'ns1',
                  assignable_name: 'coll1',
                  assignable_role_name: 'role1',
                },
                variables: [
                  {
                    name: 'var1',
                    data_type: 'string',
                    raw_value: '--- val1',
                    binding: nil,
                  },
                ],
              },
              {
                assignment: {
                  assignable_type: 'ForemanAnsibleDirector::AnsibleCollectionRole',
                  assignable_namespace: 'ns2',
                  assignable_name: 'coll2',
                  assignable_role_name: 'role2',
                },
                variables: [
                  {
                    name: 'var2',
                    data_type: 'string',
                    raw_value: '--- val2',
                    binding: nil,
                  },
                ],
              },
            ]

            result = ForemanAnsibleDirector::Generators::VariableGenerator.generate(
              resolved_host_variables: resolved
            )

            assert_equal 2, result.length
            assert_includes result.keys, 'ns1.coll1.role1_vars.yaml'
            assert_includes result.keys, 'ns2.coll2.role2_vars.yaml'
          end

          test 'generates key without role_name for non-CollectionRole assignable types' do
            resolved = [
              {
                assignment: {
                  assignable_type: 'ForemanAnsibleDirector::AnsibleRole',
                  assignable_namespace: 'acme',
                  assignable_name: 'my_role',
                },
                variables: [
                  {
                    name: 'var1',
                    data_type: 'string',
                    raw_value: '--- value',
                    binding: nil,
                  },
                ],
              },
            ]

            result = ForemanAnsibleDirector::Generators::VariableGenerator.generate(
              resolved_host_variables: resolved
            )

            assert_equal 1, result.length
            assert_includes result.keys, 'acme.my_role_vars.yaml'
          end

          test 'produces valid YAML output' do
            resolved = [
              {
                assignment: {
                  assignable_type: 'ForemanAnsibleDirector::AnsibleCollectionRole',
                  assignable_namespace: 'ns',
                  assignable_name: 'coll',
                  assignable_role_name: 'role',
                },
                variables: [
                  {
                    name: 'complex_var',
                    data_type: 'dictionary',
                    raw_value: "---\nnested:\n  key: value",
                    binding: nil,
                  },
                ],
              },
            ]

            result = ForemanAnsibleDirector::Generators::VariableGenerator.generate(
              resolved_host_variables: resolved
            )

            decoded = Base64.decode64(result['ns.coll.role_vars.yaml'])
            parsed = YAML.safe_load(decoded)
            assert_instance_of Hash, parsed
            assert_includes parsed.keys, 'complex_var'
          end
        end
      end
    end
  end
end
