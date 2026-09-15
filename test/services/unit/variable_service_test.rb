require 'foreman_ansible_director_test_helper'

module ForemanAnsibleDirectorTests
  module Services
    module Unit
      class VariableServiceTest < ForemanAnsibleDirectorTestCase

        setup do
          @collection = FactoryBot.create(:ansible_collection, organization: @organization)
          @collection_version = FactoryBot.create(:content_unit_version, :for_collection, versionable: @collection)
          @collection_role = FactoryBot.create(:ansible_collection_role, ansible_collection_version: @collection_version)

          @path = FactoryBot.create(:lifecycle_environment_path, organization: @organization)
          @lifecycle_environment = FactoryBot.create(:lifecycle_environment, organization: @organization, lifecycle_environment_path: @path)
          FactoryBot.create(
            :lifecycle_environment_content_unit_version,
            lifecycle_environment: @lifecycle_environment,
            content_unit_version: @collection_version
          )
          as_admin do
            @host = FactoryBot.create(:host, ansible_lifecycle_environment: @lifecycle_environment)
            @host2 = FactoryBot.create(:host, ansible_lifecycle_environment: @lifecycle_environment)
          end
        end

        describe '#create_variable' do
          test 'creates a variable with valid params for collection role' do
            variable = ::ForemanAnsibleDirector::VariableService.create_variable(
              name: 'test_variable',
              data_type: 'string',
              raw_value: 'test_value',
              owner: @collection_role,
              organization_id: @organization.id
            )

            assert_not_nil variable
            assert_equal 'test_variable', variable.name
            assert_equal 'test_value', variable.raw_value
            assert_equal 'string', variable.data_type
            assert_equal @collection_role, variable.ownable
          end

          test 'creates a variable with optional query/transform params' do
            variable = ::ForemanAnsibleDirector::VariableService.create_variable(
              name: 'explicit_q_t_var',
              data_type: 'string',
              raw_value: '--- "value"',
              owner: @collection_role,
              query: 0,
              query_data: { some: "query" },
              transformer: 0,
              transformer_data: { some: 'transformer' },
              organization_id: @organization.id
            )

            assert_not_nil variable
            assert_equal 'explicit_q_t_var', variable.name
            assert_equal "local", variable[:query]
            assert_equal "static", variable[:transformer]
            assert_equal "query", variable[:query_data]["some"]
            assert_equal "transformer", variable[:transformer_data]["some"]
          end

          test 'creates a variable within a transaction' do
            assert_difference('::ForemanAnsibleDirector::AnsibleVariable.count', 1) do
              ::ForemanAnsibleDirector::VariableService.create_variable(
                name: 'txn_var',

                data_type: 'integer',
                raw_value: 42,
                owner: @collection_role,
                organization_id: @organization.id
              )
            end
          end
        end
        describe '#edit_variable' do
          setup do
            as_admin do
              @variable = FactoryBot.create(:ansible_variable, :for_collection_role, ownable: @collection_role)
            end
          end

          test 'updates variable attributes directly' do
            ::ForemanAnsibleDirector::VariableService.edit_variable(
              variable: @variable,
              name: 'updated_name',
              data_type: 'boolean',
              raw_value: '--- true'
            )
            @variable.reload

            assert_equal 'updated_name', @variable.name
            assert_equal 'boolean', @variable.data_type
            assert_equal '--- true', @variable.raw_value
          end

          test 'updates partial attributes when not all provided' do
            original_name = @variable.name
            ::ForemanAnsibleDirector::VariableService.edit_variable(
              variable: @variable,
              data_type: 'dictionary'
            )
            @variable.reload

            assert_equal original_name, @variable.name
            assert_equal 'dictionary', @variable.data_type
          end

          test 'updates within a transaction' do
            assert_nothing_raised do
              ::ForemanAnsibleDirector::VariableService.edit_variable(
                variable: @variable,
                raw_value: 'new_value'
              )
            end
            @variable.reload
            assert_equal 'new_value', @variable.raw_value
          end
        end

        describe '#collect_hierarchical_bindings' do
          setup do
            @hostgroup = FactoryBot.create(
              :hostgroup,
              organizations: [@organization],
              ansible_lifecycle_environment: @lifecycle_environment
            )
            @host.update!(hostgroup: @hostgroup)

            FactoryBot.create(
              :ansible_content_assignment,
              consumable: @host,
              assignable_namespace: @collection.namespace,
              assignable_name: @collection.name,
              assignable_role_name: @collection_role.name
            )
          end

          test 'result includes all higher items in the hieararchy' do
            result = ::ForemanAnsibleDirector::VariableService.collect_hierarchical_bindings(
              assignable_type: 'ForemanAnsibleDirector::AnsibleCollectionRole',
              assignable_name: @collection_role.name,
              assignable_namespace: @collection.namespace,
              variable_name: 'nonexistent_var',
              target: @host
            )

            assert_equal 2, result.length
            assert_nil result[0][:binding]
            assert_nil result[1][:binding]
          end

          test 'returns binding from host when host has one' do
            FactoryBot.create(
              :ansible_variable_binding,
              consumable: @host,
              assignable_type: 'ForemanAnsibleDirector::AnsibleCollectionRole',
              assignable_namespace: @collection.namespace,
              assignable_name: @collection.name,
              assignable_role_name: @collection_role.name,
              variable_name: 'host_var',
              raw_value: 'host_binding_value',
              organization: @organization
            )

            result = ::ForemanAnsibleDirector::VariableService.collect_hierarchical_bindings(
              assignable_type: 'ForemanAnsibleDirector::AnsibleCollectionRole',
              assignable_name: @collection.name,
              assignable_namespace: @collection.namespace,
              assignable_role_name: @collection_role.name,
              variable_name: 'host_var',
              target: @host
            )

            assert_equal 2, result.length
            assert_equal @host, result[-1][:node]
            assert_not_nil result[-1][:binding]
            assert_equal 'host_var', result[-1][:binding].variable_name
            assert_equal 'host_binding_value', result[-1][:binding].raw_value
          end

          test 'returns binding from hostgroup when hostgroup has one' do
            FactoryBot.create(
              :ansible_variable_binding,
              consumable: @hostgroup,
              assignable_type: 'ForemanAnsibleDirector::AnsibleCollectionRole',
              assignable_namespace: @collection.namespace,
              assignable_name: @collection.name,
              assignable_role_name: @collection_role.name,
              variable_name: 'hostgroup_var',
              raw_value: 'hostgroup_binding_value',
              organization: @organization
            )

            result = ::ForemanAnsibleDirector::VariableService.collect_hierarchical_bindings(
              assignable_type: 'ForemanAnsibleDirector::AnsibleCollectionRole',
              assignable_name: @collection.name,
              assignable_namespace: @collection.namespace,
              assignable_role_name: @collection_role.name,
              variable_name: 'hostgroup_var',
              target: @host
            )

            assert_equal 2, result.length
            assert_not_nil result[0][:binding]
            assert_equal @hostgroup, result[0][:node]
            assert_equal 'hostgroup_var', result[0][:binding].variable_name
            assert_equal 'hostgroup_binding_value', result[0][:binding].raw_value
            assert_nil result[-1][:binding]
          end

          test 'returns bindings from multiple levels in hierarchy' do
            FactoryBot.create(
              :ansible_variable_binding,
              consumable: @host,
              assignable_type: 'ForemanAnsibleDirector::AnsibleCollectionRole',
              assignable_namespace: @collection.namespace,
              assignable_name: @collection.name,
              assignable_role_name: @collection_role.name,
              variable_name: 'my_var',
              raw_value: 'host_value',
              organization: @organization
            )
            FactoryBot.create(
              :ansible_variable_binding,
              consumable: @hostgroup,
              assignable_type: 'ForemanAnsibleDirector::AnsibleCollectionRole',
              assignable_namespace: @collection.namespace,
              assignable_name: @collection.name,
              assignable_role_name: @collection_role.name,
              variable_name: 'my_var',
              raw_value: 'hostgroup_value',
              organization: @organization
            )

            result = ::ForemanAnsibleDirector::VariableService.collect_hierarchical_bindings(
              assignable_type: 'ForemanAnsibleDirector::AnsibleCollectionRole',
              assignable_name: @collection.name,
              assignable_namespace: @collection.namespace,
              assignable_role_name: @collection_role.name,
              variable_name: 'my_var',
              target: @host
            )

            assert_equal 2, result.length
            assert_equal @host, result[-1][:node]
            assert_equal 'host_value', result[-1][:binding].raw_value
            assert_equal @hostgroup, result[0][:node]
            assert_equal 'hostgroup_value', result[0][:binding].raw_value
          end
        end

        describe '#resolve_single' do
          setup do
            as_admin do
              @hostgroup = FactoryBot.create(
                :hostgroup,
                organizations: [@organization],
                ansible_lifecycle_environment: @lifecycle_environment
              )
              @host.update!(hostgroup: @hostgroup)
            end

            FactoryBot.create(
              :ansible_content_assignment,
              consumable: @host,
              assignable_namespace: @collection.namespace,
              assignable_name: @collection.name,
              assignable_role_name: @collection_role.name
            )

            @variable = FactoryBot.create(
              :ansible_variable,
              name: 'role_var',
              data_type: 'string',
              raw_value: 'default_value',
              ownable: @collection_role,
              organization: @organization
            )
          end

          test 'returns hierarchical bindings and referenced variable for valid CRN' do
            result = ::ForemanAnsibleDirector::VariableService.resolve_single(
              assignable_type: 'ForemanAnsibleDirector::AnsibleCollectionRole',
              assignable_name: @collection.name,
              assignable_namespace: @collection.namespace,
              assignable_role_name: @collection_role.name,
              variable_name: 'role_var',
              target: @host
            )

            hierarchical_bindings, referenced_variable = result

            assert_not_nil referenced_variable
            assert_equal @variable, referenced_variable
            assert_equal 2, hierarchical_bindings.length
            assert_nil hierarchical_bindings[0][:binding]
            assert_nil hierarchical_bindings[1][:binding]
          end

          test 'returns empty arrays when no matching assignment found' do
            result = ::ForemanAnsibleDirector::VariableService.resolve_single(
              assignable_type: 'ForemanAnsibleDirector::AnsibleCollectionRole',
              assignable_name: 'nonexistent_role',
              assignable_namespace: 'nonexistent_ns',
              variable_name: 'role_var',
              target: @host
            )

            assert_equal [], result[0]
            assert_nil result[1]
          end

          test 'returns nil variable when variable name not found' do
            result = ::ForemanAnsibleDirector::VariableService.resolve_single(
              assignable_type: 'ForemanAnsibleDirector::AnsibleCollectionRole',
              assignable_name: @collection.name,
              assignable_namespace: @collection.namespace,
              assignable_role_name: @collection_role.name,
              variable_name: 'nonexistent_var',
              target: @host
            )

            assert_equal [], result[0]
            assert_nil result[1]
          end

          test 'includes bindings collected from hierarchy' do
            FactoryBot.create(
              :ansible_variable_binding,
              consumable: @host,
              assignable_type: 'ForemanAnsibleDirector::AnsibleCollectionRole',
              assignable_namespace: @collection.namespace,
              assignable_name: @collection.name,
              assignable_role_name: @collection_role.name,
              variable_name: 'role_var',
              raw_value: 'host_value',
              data_type: 'string',
              organization: @organization
            )

            FactoryBot.create(
              :ansible_variable_binding,
              consumable: @hostgroup,
              assignable_type: 'ForemanAnsibleDirector::AnsibleCollectionRole',
              assignable_namespace: @collection.namespace,
              assignable_name: @collection.name,
              assignable_role_name: @collection_role.name,
              variable_name: 'role_var',
              raw_value: 'hostgroup_value',
              data_type: 'string',
              organization: @organization
            )


            hierarchical_bindings, referenced_variable = ::ForemanAnsibleDirector::VariableService.resolve_single(
              assignable_type: 'ForemanAnsibleDirector::AnsibleCollectionRole',
              assignable_name: @collection.name,
              assignable_namespace: @collection.namespace,
              assignable_role_name: @collection_role.name,
              variable_name: 'role_var',
              target: @host
            )

            assert_equal 2, hierarchical_bindings.length
            assert_equal 'hostgroup_value', hierarchical_bindings[0][:binding].raw_value
            assert_equal 'host_value', hierarchical_bindings[1][:binding].raw_value
          end
        end

        describe '#variables_for' do
          setup do
            as_admin do
              @hostgroup = FactoryBot.create(
                :hostgroup,
                organizations: [@organization],
                ansible_lifecycle_environment: @lifecycle_environment
              )
              @host.update!(hostgroup: @hostgroup)
            end

            FactoryBot.create(
              :ansible_content_assignment,
              consumable: @host,
              assignable_namespace: @collection.namespace,
              assignable_name: @collection.name,
              assignable_role_name: @collection_role.name
            )

            @variable = FactoryBot.create(
              :ansible_variable,
              name: 'test_var',
              data_type: 'string',
              raw_value: 'value123',
              ownable: @collection_role,
              organization: @organization
            )
          end

          test 'returns hierarchical bindings without resolved values when resolve is false' do
            bindings, resolved_variables, hiera = ::ForemanAnsibleDirector::VariableService.variables_for(
              target: @host,
              resolve: false
            )

            assert_equal 0, bindings.length
            assert_equal 0, resolved_variables.length
            assert_equal 2, hiera.length
          end

          test 'returns resolved variables when resolve is true' do
            bindings, resolved_variables, hiera = ::ForemanAnsibleDirector::VariableService.variables_for(
              target: @host,
              resolve: true
            )

            assert resolved_variables.any? do |assignment|
              assignment[:variables].any? { |v| v[:name] == 'test_var' }
            end
          end

          test 'returns hierarchy from content_source_for traversal' do
            _bindings, _resolved, hiera = ::ForemanAnsibleDirector::VariableService.variables_for(
              target: @host,
              resolve: false
            )

            assert_equal 2, hiera.length
            assert hiera.any? { |node| node == @host }
            assert hiera.any? { |node| node == @hostgroup }
          end

          test 'resolves bindings, variables and hieararchy' do
            assignment = FactoryBot.create(
              :ansible_content_assignment,
              consumable: @host,
              assignable_namespace: @collection.namespace,
              assignable_name: @collection.name,
              assignable_role_name: @collection_role.name
            )
            variable1 = FactoryBot.create(
              :ansible_variable,
              name: 'test_var_1',
              data_type: 'string',
              raw_value: 'var1',
              ownable: @collection_role,
              organization: @organization
            )
            variable2 = FactoryBot.create(
              :ansible_variable,
              name: 'test_var_2',
              data_type: 'string',
              raw_value: 'var2',
              ownable: @collection_role,
              organization: @organization
            )
            host_binding = FactoryBot.create(
              :ansible_variable_binding,
              consumable: @host,
              assignable_type: 'ForemanAnsibleDirector::AnsibleCollectionRole',
              assignable_namespace: @collection.namespace,
              assignable_name: @collection.name,
              assignable_role_name: @collection_role.name,
              variable_name: 'test_var_1',
              raw_value: 'var_1_host',
              organization: @organization
            )
            hostgroup_binding = FactoryBot.create(
              :ansible_variable_binding,
              consumable: @hostgroup,
              assignable_type: 'ForemanAnsibleDirector::AnsibleCollectionRole',
              assignable_namespace: @collection.namespace,
              assignable_name: @collection.name,
              assignable_role_name: @collection_role.name,
              variable_name: 'test_var_2',
              raw_value: 'var_2_hg',
              organization: @organization
            )

            bindings, resolved, hiera = ::ForemanAnsibleDirector::VariableService.variables_for(
              target: @host,
              resolve: true
            )

            # Hiearchy assertions
            assert_equal 2, hiera.length
            assert_equal @host, hiera[0]
            assert_equal @hostgroup, hiera[1]
            # Variable assertions
            assert_equal 1, resolved.length # 1 assignable (@collection_role)
            assert_equal assignment, resolved[0][:assignment]
            assert_equal 3, resolved[0][:variables].length # 3 variables belonging to @collection_role
            refute_nil resolved[0][:variables].filter { |v| v[:name] == 'test_var_1' }.first[:binding] # Bound to host
            assert_equal "var_1_host", resolved[0][:variables].filter { |v| v[:name] == 'test_var_1' }.first[:binding][:raw_value]
            refute_nil resolved[0][:variables].filter { |v| v[:name] == 'test_var_2' }.first[:binding] # Bound to hg
            assert_equal "var_2_hg", resolved[0][:variables].filter { |v| v[:name] == 'test_var_2' }.first[:binding][:raw_value]
            assert_nil resolved[0][:variables].filter { |v| v[:name] == 'test_var' }.first[:binding] # Default value
            # Binding assertions
            assert_equal 2, bindings.length
            assert_includes bindings, host_binding
            assert_includes bindings, hostgroup_binding
          end
        end

        describe '#resolve_values' do
          setup do
            FactoryBot.create(
              :ansible_content_assignment,
              consumable: @host,
              assignable_namespace: @collection.namespace,
              assignable_name: @collection.name,
              assignable_role_name: @collection_role.name
            )

            @variable = FactoryBot.create(
              :ansible_variable,
              name: 'resolve_me',
              data_type: 'string',
              raw_value: 'resolved_value',
              ownable: @collection_role,
              organization: @organization
            )
          end

          test 'maps variables with their bindings for target' do
            bindings, _, _ = ::ForemanAnsibleDirector::VariableService.variables_for(
              target: @host,
              resolve: false
            )

            resolved = ::ForemanAnsibleDirector::VariableService.resolve_values(
              target: @host,
              resolved_bindings: bindings
            )

            assert_instance_of Array, resolved
            assert resolved.any? { |m| m[:variables].any? { |v| v[:name] == 'resolve_me' } }
          end

          test 'includes binding data when binding exists' do
            FactoryBot.create(
              :ansible_variable_binding,
              consumable: @host,
              assignable_type: 'ForemanAnsibleDirector::AnsibleCollectionRole',
              assignable_namespace: @collection.namespace,
              assignable_name: @collection.name,
              assignable_role_name: @collection_role.name,
              variable_name: 'resolve_me',
              raw_value: 'binding_resolves_to_this',
              organization: @organization
            )

            bindings, _, _ = ::ForemanAnsibleDirector::VariableService.variables_for(
              target: @host,
              resolve: false
            )

            resolved = ::ForemanAnsibleDirector::VariableService.resolve_values(
              target: @host,
              resolved_bindings: bindings
            )

            assignment_with_var = resolved.find { |m| m[:variables].any? { |v| v[:name] == 'resolve_me' } }
            var_entry = assignment_with_var[:variables].find { |v| v[:name] == 'resolve_me' }

            assert_not_nil var_entry[:binding]
            assert_equal 'binding_resolves_to_this', var_entry[:binding][:raw_value]
          end

          test 'has nil binding when no binding exists for variable' do
            bindings, _, _ = ::ForemanAnsibleDirector::VariableService.variables_for(
              target: @host,
              resolve: false
            )

            resolved = ::ForemanAnsibleDirector::VariableService.resolve_values(
              target: @host,
              resolved_bindings: bindings
            )

            assignment_with_var = resolved.find { |m| m[:variables].any? { |v| v[:name] == 'resolve_me' } }
            var_entry = assignment_with_var[:variables].find { |v| v[:name] == 'resolve_me' }

            assert_nil var_entry[:binding]
          end

          test 'includes all variables from resolved assignments' do
            second_variable = FactoryBot.create(
              :ansible_variable,
              name: 'resolve_me_too',
              data_type: 'integer',
              raw_value: 99,
              ownable: @collection_role,
              organization: @organization
            )

            bindings, _, _ = ::ForemanAnsibleDirector::VariableService.variables_for(
              target: @host,
              resolve: false
            )

            resolved = ::ForemanAnsibleDirector::VariableService.resolve_values(
              target: @host,
              resolved_bindings: bindings
            )

            assignment_with_vars = resolved.find { |m| m[:variables].any? { |v| v[:name] == 'resolve_me' } }
            variable_names = assignment_with_vars[:variables].map { |v| v[:name] }

            assert variable_names.include?('resolve_me')
            assert variable_names.include?('resolve_me_too')
          end

          test 'includes assignment data in result' do
            bindings, _, _ = ::ForemanAnsibleDirector::VariableService.variables_for(
              target: @host,
              resolve: false
            )

            resolved = ::ForemanAnsibleDirector::VariableService.resolve_values(
              target: @host,
              resolved_bindings: bindings
            )

            assert resolved.any? do |m|
              m[:assignment].key?(:assignable_type) &&
                m[:assignment].key?(:assignable_namespace) &&
                m[:assignment].key?(:assignable_name) &&
                m[:assignment].key?(:assignable_role_name)
            end
          end

          test 'handles empty bindings gracefully' do
            resolved = ::ForemanAnsibleDirector::VariableService.resolve_values(
              target: @host,
              resolved_bindings: []
            )

            assert_instance_of Array, resolved
            assert_equal 1, resolved.length # Default value
          end
        end
      end
    end
  end
end
