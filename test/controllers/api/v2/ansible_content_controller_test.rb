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
        end

        test 'allows requests without organization context' do
          Organization.current = nil
          first_unit = FactoryBot.create(
            :ansible_collection,
            organization: @organization,
            name: 'visible_without_org_context'
          )

          get :index, params: {}, session: set_session_user

          assert_response :success
          assert_includes response.body, first_unit.name
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
      end
    end
  end
end
