# frozen_string_literal: true

require 'foreman_ansible_director_test_helper'

module ForemanAnsibleDirectorTests
  module Models
    class AnsibleVariableTest < ForemanAnsibleDirectorTestCase

      describe '#bound_by' do
        describe 'for AnsibleCollectionRole' do
          setup do
            @collection = FactoryBot.create(:ansible_collection, organization: @organization)
            @collection_version = FactoryBot.create(:content_unit_version, :for_collection, versionable: @collection)
            @collection_role = FactoryBot.create(:ansible_collection_role, ansible_collection_version: @collection_version)
            @variable = FactoryBot.create(:ansible_variable, :for_collection_role, ownable: @collection_role, organization: @organization)
          end

          test 'returns bindings filtered by collection role attributes' do
            cv = @collection_role.ansible_collection_version
            cv_ns = cv.versionable.namespace
            cv_name = cv.versionable.name

            binding1 = FactoryBot.create(
              :ansible_variable_binding,
              variable_name: @variable.name,
              assignable_type: 'ForemanAnsibleDirector::AnsibleCollectionRole',
              assignable_namespace: cv_ns,
              assignable_name: cv_name,
              assignable_role_name: @collection_role.name,
              organization: @organization
            )

            FactoryBot.create(
              :ansible_variable_binding,
              variable_name: @variable.name,
              assignable_type: 'ForemanAnsibleDirector::AnsibleCollectionRole',
              assignable_namespace: 'other_namespace',
              assignable_name: 'other_role',
              assignable_role_name: 'other_role_name',
              organization: @organization
            )

            bindings = @variable.bound_by

            assert_equal 1, bindings.count
            assert_equal binding1, bindings.first
          end

          test 'returns empty scope when no bindings exist' do
            assert_empty @variable.bound_by
          end

          test 'filters by organization' do
            as_admin do
              other_org = FactoryBot.create(:organization)
              cv = @collection_role.ansible_collection_version
              FactoryBot.create(
                :ansible_variable_binding,
                variable_name: @variable.name,
                assignable_type: 'ForemanAnsibleDirector::AnsibleCollectionRole',
                assignable_namespace: cv.versionable.namespace,
                assignable_name: cv.versionable.name,
                assignable_role_name: @collection_role.name,
                organization: other_org
              )
            end

            assert_empty @variable.bound_by
          end
        end

        describe 'for AnsibleRole' do
          setup do
            @role = FactoryBot.create(:ansible_role, organization: @organization)
            @variable = FactoryBot.create(:ansible_variable, :for_ansible_role, ownable: @role, organization: @organization)
          end

          test 'returns bindings filtered by role attributes' do
            binding1 = FactoryBot.create(
              :ansible_variable_binding,
              :for_ansible_role,
              variable_name: @variable.name,
              assignable_namespace: @role.namespace,
              assignable_name: @role.name,
              organization: @organization
            )

            FactoryBot.create(
              :ansible_variable_binding,
              :for_ansible_role,
              variable_name: @variable.name,
              assignable_namespace: 'other_namespace',
              assignable_name: 'other_role',
              organization: @organization
            )

            bindings = @variable.bound_by

            assert_equal 1, bindings.count
            assert_equal binding1, bindings.first
          end

          test 'returns empty scope when no bindings exist' do
            assert_empty @variable.bound_by
          end

          test 'filters by organization' do
            as_admin do
              other_org = FactoryBot.create(:organization)
              FactoryBot.create(
                :ansible_variable_binding,
                :for_ansible_role,
                variable_name: @variable.name,
                assignable_namespace: @role.namespace,
                assignable_name: @role.name,
                organization: other_org
              )
            end

            assert_empty @variable.bound_by
          end
        end
      end

      describe '#render_for_api' do
        setup do
          @collection = FactoryBot.create(:ansible_collection, organization: @organization)
          @collection_version = FactoryBot.create(:content_unit_version, :for_collection, versionable: @collection)
          @collection_role = FactoryBot.create(:ansible_collection_role, ansible_collection_version: @collection_version)
          @variable = FactoryBot.create(
            :ansible_variable,
            :for_collection_role,
            ownable: @collection_role,
            organization: @organization
          )
        end

        test 'returns a hash with expected keys' do
          result = @variable.render_for_api

          assert_instance_of Hash, result
          assert_equal @variable.id, result[:id]
          assert_equal @variable.name, result[:name]
          assert_equal @variable.data_type, result[:data_type]
          assert_equal @variable.raw_value, result[:raw_value]
          assert_equal 'local', result[:query]
          assert_equal 'static', result[:transformer]
          assert_equal @variable.value, result[:parsed_value]
          assert_equal 0, result[:bindings_count]
        end

        test 'includes correct bindings_count when bindings exist' do
          cv = @collection_role.ansible_collection_version
          FactoryBot.create(
            :ansible_variable_binding,
            variable_name: @variable.name,
            assignable_type: 'ForemanAnsibleDirector::AnsibleCollectionRole',
            assignable_namespace: cv.versionable.namespace,
            assignable_name: cv.versionable.name,
            assignable_role_name: @collection_role.name,
            organization: @organization
          )
          FactoryBot.create(
            :ansible_variable_binding,
            variable_name: @variable.name,
            assignable_type: 'ForemanAnsibleDirector::AnsibleCollectionRole',
            assignable_namespace: cv.versionable.namespace,
            assignable_name: cv.versionable.name,
            assignable_role_name: @collection_role.name,
            organization: @organization
          )

          result = @variable.render_for_api

          assert_equal 2, result[:bindings_count]
        end
      end
    end
  end
end
