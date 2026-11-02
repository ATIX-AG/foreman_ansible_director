# frozen_string_literal: true

require 'foreman_ansible_director_test_helper'

module ForemanAnsibleDirectorTests
  module Api
    module V2
      class AnsibleVariablesControllerTest < ActionController::TestCase
        tests ::ForemanAnsibleDirector::Api::V2::AnsibleVariablesController

        setup do
          User.current = User.find_by(login: 'admin')
          @organization = Organization.find_by(name: 'Organization 1')
          Organization.current = @organization

          as_admin do
            @variable = FactoryBot.create(
              :ansible_variable,
              :for_ansible_role,
              name: 'ntp_server',
              organization: @organization
            )
          end
        end

        test 'shows variable by id' do
          get :show, params: { id: @variable.id, organization_id: @organization.id }
          assert_response :success
        end

        test 'shows variable by name' do
          get :show, params: { id: 'ntp_server', organization_id: @organization.id }
          assert_response :success
        end

        test 'returns not found for unknown name' do
          get :show, params: { id: 'does_not_exist', organization_id: @organization.id }
          assert_response :not_found
        end
      end
    end
  end
end
