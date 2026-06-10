# frozen_string_literal: true

require 'foreman_ansible_director_test_helper'

module ForemanAnsibleDirectorTests
  module Generators
    module Unit
      class VariableGeneratorTest < ForemanAnsibleDirectorTestCase
        setup do
          as_admin do
            @host = FactoryBot.create(:host)
          end

          @collection = FactoryBot.create(
            :ansible_collection,
            organization: @organization,
            namespace: 'example',
            name: 'demo'
          )
          @collection_version = FactoryBot.create(
            :content_unit_version,
            :for_collection,
            versionable: @collection
          )
          @collection_role = FactoryBot.create(
            :ansible_collection_role,
            ansible_collection_version: @collection_version,
            name: 'app'
          )

          FactoryBot.create(
            :ansible_content_assignment,
            consumable: @host,
            assignable_type: 'ForemanAnsibleDirector::AnsibleCollectionRole',
            assignable_namespace: @collection.namespace,
            assignable_name: @collection.name,
            assignable_role_name: @collection_role.name
          )
        end

        test 'includes default values for collection role variables' do
          as_admin do
            FactoryBot.create(
              :ansible_variable,
              :for_collection_role,
              ownable: @collection_role,
              key: 'package_state',
              default_value: 'present'
            )
          end

          variables = ::ForemanAnsibleDirector::Generators::VariableGenerator.generate(
            host: @host,
            resolved_host_content: [{ cuv: @collection_role }]
          )

          assert_equal(
            { 'example.demo.app' => { 'package_state' => 'present' } },
            variables
          )
        end

        test 'prefers host-specific overrides over default values' do
          variable = nil
          as_admin do
            variable = FactoryBot.create(
              :ansible_variable,
              :for_collection_role,
              ownable: @collection_role,
              key: 'service_enabled',
              key_type: 'string',
              default_value: 'false',
              override: true,
              path: 'fqdn'
            )
          end

          FactoryBot.create(
            :lookup_value,
            lookup_key: variable,
            match: "fqdn=#{@host.fqdn}",
            value: 'true'
          )

          variables = ::ForemanAnsibleDirector::Generators::VariableGenerator.generate(
            host: @host,
            resolved_host_content: [{ cuv: @collection_role }]
          )

          assert_equal(
            { 'example.demo.app' => { 'service_enabled' => 'true' } },
            variables
          )
        end
      end
    end
  end
end
