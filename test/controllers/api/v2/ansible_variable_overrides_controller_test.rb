# frozen_string_literal: true

require 'foreman_ansible_director_test_helper'

module ForemanAnsibleDirectorTests
  module Api
    module V2
      class AnsibleVariableOverridesControllerTest < ActionController::TestCase
        tests ::ForemanAnsibleDirector::Api::V2::AnsibleVariableOverridesController

        setup do
          User.current = User.find_by(login: 'admin')
          @organization = Organization.find_by(name: 'Organization 1')
          Organization.current = @organization

          @collection = FactoryBot.create(:ansible_collection, organization: @organization)
          @collection_version = FactoryBot.create(:content_unit_version, :for_collection, versionable: @collection)
          @collection_role = FactoryBot.create(:ansible_collection_role, ansible_collection_version: @collection_version)

          @path = FactoryBot.create(:lifecycle_environment_path, organization: @organization)
          @lifecycle_environment = FactoryBot.create(
            :lifecycle_environment,
            organization: @organization,
            lifecycle_environment_path: @path
          )
          FactoryBot.create(
            :lifecycle_environment_content_unit_version,
            lifecycle_environment: @lifecycle_environment,
            content_unit_version: @collection_version
          )

          as_admin do
            @host = FactoryBot.create(:host, ansible_lifecycle_environment: @lifecycle_environment)
            @variable = FactoryBot.create(:ansible_variable, :for_collection_role, ownable: @collection_role)
          end

          @override = FactoryBot.create(
            :lookup_value,
            lookup_key: @variable,
            match: "fqdn=#{@host.fqdn}",
            value: 'original_value'
          )
        end

        test 'updates override by id' do
          put :update,
            params: {
              ansible_variable_id: @variable.id,
              id: @override.id,
              override: {
                value: 'updated_by_id',
                matcher: 'fqdn',
                matcher_value: @host.fqdn
              }
            },
            session: set_session_user

          assert_response :success
          @override.reload
          assert_equal 'updated_by_id', @override.value
          assert_equal "fqdn=#{@host.fqdn}", @override.match
        end

      end
    end
  end
end
