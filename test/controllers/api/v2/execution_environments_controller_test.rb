# frozen_string_literal: true

require 'foreman_ansible_director_test_helper'

module ForemanAnsibleDirectorTests
  module Api
    module V2
      class ExecutionEnvironmentsControllerTest < ActionController::TestCase
        tests ::ForemanAnsibleDirector::Api::V2::ExecutionEnvironmentsController

        setup do
          User.current = User.find_by(login: 'admin')
          @organization = Organization.find_by(name: 'Organization 1')
          @other_organization = Organization.find_by(name: 'Organization 2')

          as_admin do
            @viewer = FactoryBot.create(
              :user,
              organizations: [@organization],
              locations: [Location.find_by(name: 'Location 1')]
            )
            @viewer.roles << Role.find_by!(name: 'AnsibleDirector Viewer')
          end

          @matching_execution_environment = FactoryBot.create(
            :execution_environment,
            organization: @organization,
            name: 'matching-ee'
          )
          FactoryBot.create(
            :execution_environment,
            organization: @other_organization,
            name: 'other-ee'
          )
        end

        test 'limits index without organization context to the current user organizations' do
          User.current = @viewer
          Organization.current = nil

          get :index,
            params: {},
            session: set_session_user(@viewer)

          assert_response :success
          assert_includes response.body, @matching_execution_environment.name
          assert_not_includes response.body, 'other-ee'
        end

        test 'admin without organization context sees all resources' do
          User.current = User.find_by(login: 'admin')
          Organization.current = nil

          get :index,
            params: {},
            session: set_session_user

          assert_response :success
          assert_includes response.body, @matching_execution_environment.name
          assert_includes response.body, 'other-ee'
        end

        test 'filters index by explicit organization' do
          Organization.current = nil

          get :index,
            params: { organization_id: @organization.id },
            session: set_session_user

          assert_response :success
          assert_includes response.body, @matching_execution_environment.name
          assert_not_includes response.body, 'other-ee'
        end

        test 'non-admin cannot view other organization resources' do
          User.current = @viewer
          Organization.current = nil

          get :index,
            params: { organization_id: @other_organization.id },
            session: set_session_user(@viewer)

          assert_response :not_found
          assert_not_includes response.body, 'matching-ee'
          assert_not_includes response.body, 'other-ee'
        end

        test 'creates execution environment with explicit organization when no current organization is set' do
          Organization.current = nil

          assert_difference(
            '::ForemanAnsibleDirector::ExecutionEnvironment.where(organization_id: @organization.id).count',
            1
          ) do
            post :create,
              params: {
                organization_id: @organization.id,
                execution_environment: {
                  name: 'created-ee',
                  base_image_url: 'quay.io/fedora/fedora:42',
                  ansible_version: '2.20.0',
                },
              },
              session: set_session_user
          end

          assert_response :success
        end

        test 'allows autocomplete with explicit organization' do
          Organization.current = nil

          get :auto_complete_search,
            params: {
              organization_id: @organization.id,
              search: 'name =',
            },
            session: set_session_user

          assert_response :success
          assert_includes response.body, @matching_execution_environment.name
          assert_not_includes response.body, 'other-ee'
        end
      end
    end
  end
end
