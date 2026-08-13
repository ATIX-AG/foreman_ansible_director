# frozen_string_literal: true

require 'foreman_ansible_director_test_helper'

module ForemanAnsibleDirectorTests
  module Api
    module V2
      class AnsibleContentControllerTest < ActionController::TestCase
        tests ::ForemanAnsibleDirector::Api::V2::AnsibleContentController

        setup do
          User.current = User.find_by(login: 'admin')
          @organization = Organization.find_by(name: 'Organization 1')

          as_admin do
            @viewer = FactoryBot.create(
              :user,
              organizations: [@organization],
              locations: [Location.find_by(name: 'Location 1')]
            )
            @viewer.roles << Role.find_by!(name: 'AnsibleDirector Viewer')
          end
        end

        test 'limits requests without organization context to the current user organizations' do
          User.current = @viewer
          Organization.current = nil
          first_unit = FactoryBot.create(
            :ansible_collection,
            organization: @organization,
            name: 'visible_without_org_context'
          )
          FactoryBot.create(
            :ansible_collection,
            organization: Organization.find_by(name: 'Organization 2'),
            name: 'hidden_without_org_context'
          )

          get :index, params: {}, session: set_session_user(@viewer)

          assert_response :success
          assert_includes response.body, first_unit.name
          assert_not_includes response.body, 'hidden_without_org_context'
        end

        test 'admin without organization context sees all resources' do
          User.current = User.find_by(login: 'admin')
          Organization.current = nil
          first_unit = FactoryBot.create(
            :ansible_collection,
            organization: @organization,
            name: 'visible_to_admin_1'
          )
          second_unit = FactoryBot.create(
            :ansible_collection,
            organization: Organization.find_by(name: 'Organization 2'),
            name: 'visible_to_admin_2'
          )

          get :index, params: {}, session: set_session_user

          assert_response :success
          assert_includes response.body, first_unit.name
          assert_includes response.body, second_unit.name
        end

        test 'filters index by explicit organization' do
          Organization.current = nil
          other_organization = Organization.find_by(name: 'Organization 2')
          matching_unit = FactoryBot.create(
            :ansible_collection,
            organization: @organization,
            name: 'matching_collection'
          )
          FactoryBot.create(:ansible_collection, organization: other_organization, name: 'other_collection')

          get :index,
            params: { organization_id: @organization.id },
            session: set_session_user

          assert_response :success
          assert_includes response.body, matching_unit.name
          assert_not_includes response.body, 'other_collection'
        end

        test 'allows autocomplete with explicit organization' do
          Organization.current = nil
          other_organization = Organization.find_by(name: 'Organization 2')
          matching_unit = FactoryBot.create(
            :ansible_collection,
            organization: @organization,
            name: 'searchable_collection'
          )
          FactoryBot.create(
            :ansible_collection,
            organization: other_organization,
            name: 'searchable_other_collection'
          )

          get :auto_complete_search,
            params: {
              organization_id: @organization.id,
              search: 'name =',
            },
            session: set_session_user

          assert_response :success
          assert_includes response.body, matching_unit.name
          assert_not_includes response.body, 'searchable_other_collection'
        end

        test 'rejects autocomplete with an unknown organization' do
          Organization.current = nil

          get :auto_complete_search,
            params: {
              organization_id: 99_999_999,
              search: 'name =',
            },
            session: set_session_user

          assert_response :not_found
          assert_includes response.body, 'Organization with id 99999999 not found'
        end

        test 'non-admin cannot view other organization resources' do
          User.current = @viewer
          Organization.current = nil
          other_organization = Organization.find_by(name: 'Organization 2')

          get :index,
            params: { organization_id: other_organization.id },
            session: set_session_user(@viewer)

          assert_response :not_found
          # Non-admin viewing other org should see nothing from that org
          assert_not_includes response.body, 'visible_to_admin_2'
        end
      end
    end
  end
end
