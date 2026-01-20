require 'foreman_ansible_director_test_helper'

module ForemanAnsibleDirectorTests
  module Services
    module Unit
      class VariableServiceTest < ForemanAnsibleDirectorTestCase

        setup do
          as_admin do
            @host = FactoryBot.create(:host)
            @host2 = FactoryBot.create(:host)
          end
          @collection = FactoryBot.create(:ansible_collection, organization: @organization)
          @collection_version = FactoryBot.create(:content_unit_version, :for_collection, versionable: @collection)
          @collection_role = FactoryBot.create(:ansible_collection_role, ansible_collection_version: @collection_version)
        end

        describe '#create_variable' do
          test 'creates a variable with valid params for collection role' do

            variable = ::ForemanAnsibleDirector::VariableService.create_variable(
              key: "test_variable",
              type: "string",
              default_value: "test_value",
              owner: @collection_role
            )

            assert_not_nil variable
            assert_equal 'test_variable', variable.key
            assert_equal 'test_value', variable.default_value
            assert_equal 'string', variable.variable_type
            assert_equal @collection_role, variable.ownable
          end

        end

        describe '#edit_variable' do
          setup do
            as_admin do
              # TODO: This does not need admin permissions. Will be fixed in the permission update
              @variable = FactoryBot.create(:ansible_variable, :for_collection_role, ownable: @collection_role)
            end
          end

          test 'updates variable with valid params' do

            ::ForemanAnsibleDirector::VariableService.edit_variable(
              variable: @variable,
              key: "updated_key",
              type: "boolean",
              default_value: true,
              overridable: true
            )
            @variable.reload

            assert_equal 'updated_key', @variable.key
            assert_equal 'boolean', @variable.key_type
            assert_equal true, @variable.default_value
            assert @variable.override
          end

          test 'variable is marked "overridden" correctly' do

            variable1 = nil
            variable2 = nil

            as_admin do
              variable1 = FactoryBot.create(:ansible_variable, :for_collection_role, ownable: @collection_role)
              variable2 = FactoryBot.create(:ansible_variable, :for_collection_role, ownable: @collection_role)
            end

            assert variable1
            assert variable2
            assert_not variable1.overridable?
            assert_not variable2.overridable?

            ::ForemanAnsibleDirector::VariableService.edit_variable(
              variable: variable1,
              key: variable1.key,
              type: variable1.key_type,
              default_value: variable1.default_value,
              overridable: true
            )
            variable1.reload

            assert variable1.overridable?

            ::ForemanAnsibleDirector::VariableService.create_override(
              variable: variable2,
              value: "new_value",
              matcher: "fqdn",
              matcher_value: @host.fqdn
            )
            variable2.reload

            assert variable2.overridable?
          end
        end

        describe '#create_override' do
          setup do
            as_admin do
              @variable = FactoryBot.create(:ansible_variable, :for_collection_role, ownable: @collection_role)
            end
          end

          test 'creates an override with valid params' do

            override = ::ForemanAnsibleDirector::VariableService.create_override(
              variable: @variable,
              value: "new_value",
              matcher: "fqdn",
              matcher_value: @host.fqdn
            )

            assert_not_nil override
            assert_equal "fqdn=#{@host.fqdn}", override.match
            assert_equal 'new_value', override.value
            assert_equal @variable.id, override.lookup_key_id
          end

        end

        describe '#edit_override' do
          setup do
            as_admin do
              @variable = FactoryBot.create(:ansible_variable, :for_collection_role, ownable: @collection_role)
            end
            @override = FactoryBot.create(:lookup_value, lookup_key: @variable, match: "fqdn=#{@host.fqdn}", value: 'original_value')
          end

          test 'updates override with valid params' do
            ::ForemanAnsibleDirector::VariableService.edit_override(
              override: @override,
              value: "new_value",
              matcher: "fqdn",
              matcher_value: @host.fqdn
            )
            @override.reload

            assert_equal 'new_value', @override.value
          end
        end

        describe '#destroy_override' do
          setup do
            as_admin do
              @variable = FactoryBot.create(:ansible_variable, :for_collection_role, ownable: @collection_role)
            end
            @override = FactoryBot.create(:lookup_value, lookup_key: @variable, match: "fqdn=#{@host.fqdn}", value: 'original_value')
          end

          test 'destroys override successfully' do
            override_id = @override.id

            ::ForemanAnsibleDirector::VariableService.destroy_override(@override)

            assert_nil LookupValue.find_by(id: override_id)
          end
        end

        describe '#get_overrides_for_target' do

          setup do
            FactoryBot.create(:ansible_content_assignment, consumable: @collection_role, assignable: @host)
            FactoryBot.create(:ansible_content_assignment, consumable: @collection_role, assignable: @host2)
          end

          test 'returns overrides for host target' do

            as_admin do
              @variables = FactoryBot.create_list(:ansible_variable, 4, :for_collection_role, ownable: @collection_role)
            end

            override1 = FactoryBot.create(:lookup_value, lookup_key: @variables[0], match: "fqdn=#{@host.fqdn}")
            override2 = FactoryBot.create(:lookup_value, lookup_key: @variables[1], match: "fqdn=#{@host.fqdn}")

            override3 = FactoryBot.create(:lookup_value, lookup_key: @variables[2], match: "fqdn=#{@host2.fqdn}")
            override4 = FactoryBot.create(:lookup_value, lookup_key: @variables[3], match: "fqdn=#{@host2.fqdn}")

            results = ::ForemanAnsibleDirector::VariableService.get_overrides_for_target(@host)

            assert_equal 2, results.length
            assert_equal override1.value, results[0][:override_value]
            assert_equal override2.value, results[1][:override_value]

            results = ::ForemanAnsibleDirector::VariableService.get_overrides_for_target(@host2)

            assert_equal 2, results.length
            assert_equal override3.value, results[0][:override_value]
            assert_equal override4.value, results[1][:override_value]
          end

          test 'includes overridable variables when flag is true' do

            as_admin do
              vars1 = FactoryBot.create_list(:ansible_variable, 2, :for_collection_role, ownable: @collection_role)
              vars2 = FactoryBot.create_list(:ansible_variable, 2, :for_collection_role, :with_override, ownable: @collection_role)
              @variables = [*vars1, *vars2]
            end

            results = ::ForemanAnsibleDirector::VariableService.get_overrides_for_target(@host, include_overridable: true)

            assert_equal 2, results.length
            assert results[0][:overridable]
            assert results[1][:overridable]

            _override1 = FactoryBot.create(:lookup_value, lookup_key: @variables[0], match: "fqdn=#{@host.fqdn}")
            _override2 = FactoryBot.create(:lookup_value, lookup_key: @variables[1], match: "fqdn=#{@host.fqdn}")
            results = ::ForemanAnsibleDirector::VariableService.get_overrides_for_target(@host, include_overridable: true)

            assert_equal 4, results.length

          end

          test 'raises error for unsupported target type' do
            unsupported_target = @organization

            assert_raises(NotImplementedError) do
              ::ForemanAnsibleDirector::VariableService.get_overrides_for_target(unsupported_target)
            end
          end

          # test 'handles yaml type variables' do TODO: I am actually not sure what the intended result is for YAML variables
          #  as_admin do
          #    @variable = FactoryBot.create(:ansible_variable, :with_override, ownable: @collection_role)
          #  end
          #
          #  update = Structs::AnsibleVariable::AnsibleVariableEdit.new(@variable.key, "yaml", "key: value", true)
          #
          #  ::ForemanAnsibleDirector::VariableService.edit_variable(update, @variable)
          #  @variable.reload
          #
          #  results = ::ForemanAnsibleDirector::VariableService.get_overrides_for_target(@host, true)
          #
          #  assert_equal "key: value", results[0][:default_value]
          # end
        end

      end
    end
  end
end