# frozen_string_literal: true

require 'foreman_ansible_director_test_helper'

module ForemanAnsibleDirectorTests
  module Api
    module V2
      class LifecycleEnvironmentPathsControllerTest < ActionController::TestCase
        tests ::ForemanAnsibleDirector::Api::V2::LifecycleEnvironmentPathsController

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

          @matching_path = FactoryBot.create(
            :lifecycle_environment_path,
            organization: @organization,
            name: 'matching-path'
          )
          FactoryBot.create(
            :lifecycle_environment_path,
            organization: @other_organization,
            name: 'other-path'
          )
        end

        test 'limits index without organization context to the current user organizations' do
          User.current = @viewer
          Organization.current = nil

          get :index,
            params: {},
            session: set_session_user(@viewer)

          assert_response :success
          assert_includes response.body, @matching_path.name
          assert_not_includes response.body, 'other-path'
        end

        test 'admin without organization context sees all resources' do
          User.current = User.find_by(login: 'admin')
          Organization.current = nil

          get :index,
            params: {},
            session: set_session_user

          assert_response :success
          assert_includes response.body, @matching_path.name
          assert_includes response.body, 'other-path'
        end

        test 'filters index by explicit organization' do
          Organization.current = nil

          get :index,
            params: { organization_id: @organization.id },
            session: set_session_user

          assert_response :success
          assert_includes response.body, @matching_path.name
          assert_not_includes response.body, 'other-path'
        end

        test 'creates lifecycle environment path with explicit organization when no current organization is set' do
          Organization.current = nil

          assert_difference(
            '::ForemanAnsibleDirector::LifecycleEnvironmentPath.where(organization_id: @organization.id).count',
            1
          ) do
            post :create,
              params: {
                organization_id: @organization.id,
                lifecycle_environment_path: {
                  name: 'created-path',
                  description: 'Created from organization scoping test',
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
          assert_includes response.body, @matching_path.name
          assert_not_includes response.body, 'other-path'
        end

        test 'non-admin cannot view other organization resources' do
          User.current = @viewer
          Organization.current = nil

          get :index,
            params: { organization_id: @other_organization.id },
            session: set_session_user(@viewer)

          assert_response :not_found
          assert_not_includes response.body, 'matching-path'
          assert_not_includes response.body, 'other-path'
        end
      end
    end
  end
end
