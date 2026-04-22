# frozen_string_literal: true

require 'foreman_ansible_director_test_helper'

module ForemanAnsibleDirectorTests
  module Controllers
    module Api
      module V2
        class StatusControllerTest < ActionController::TestCase
          tests ::ForemanAnsibleDirector::Api::V2::StatusController

          setup do
            User.current = User.find_by(login: 'admin')
            @organization ||= Organization.find_by(name: 'Organization 1')
            Organization.current = @organization
          end

          test 'content exposes global content counts' do
            ::ForemanAnsibleDirector::AnsibleRole.stub(:count, 2) do
              ::ForemanAnsibleDirector::AnsibleCollection.stub(:count, 3) do
                ::ForemanAnsibleDirector::ExecutionEnvironment.stub(:count, 4) do
                  as_admin do
                    get :content, params: { organization_id: @organization.id, format: :json }
                  end
                end
              end
            end

            assert_response :success
            assert_equal(
              {
                'roles' => 2,
                'collections' => 3,
                'execution_environments' => 4,
              },
              ActiveSupport::JSON.decode(@response.body)
            )
          end
        end
      end
    end
  end
end
