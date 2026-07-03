# frozen_string_literal: true

require 'foreman_ansible_director_test_helper'

module ForemanAnsibleDirectorTests
  module Controllers
    module Api
      module V2
        class LifecycleEnvironmentsControllerTest < ActionController::TestCase
          tests ::ForemanAnsibleDirector::Api::V2::LifecycleEnvironmentsController

          setup do
            @routes = ActionDispatch::Routing::RouteSet.new
            @routes.draw do
              get 'lifecycle_environments/:id',
                to: 'foreman_ansible_director/api/v2/lifecycle_environments#show'
              get 'lifecycle_environments/:id/content',
                to: 'foreman_ansible_director/api/v2/lifecycle_environments#content'
              post 'lifecycle_environments',
                to: 'foreman_ansible_director/api/v2/lifecycle_environments#create'
              put 'lifecycle_environments/:id',
                to: 'foreman_ansible_director/api/v2/lifecycle_environments#update'
              patch 'lifecycle_environments/:id',
                to: 'foreman_ansible_director/api/v2/lifecycle_environments#update_content'
              post 'lifecycle_environments/:id/assign/:target_type/:target_id',
                to: 'foreman_ansible_director/api/v2/lifecycle_environments#assign'
              delete 'lifecycle_environments/:id',
                to: 'foreman_ansible_director/api/v2/lifecycle_environments#destroy'
            end

            User.current = User.find_by(login: 'admin')
            @organization = Organization.find_by(name: 'Organization 1')
            Organization.current = @organization
            @path = FactoryBot.create(:lifecycle_environment_path, organization: @organization)
            @environment = FactoryBot.create(
              :lifecycle_environment,
              organization: @organization,
              lifecycle_environment_path: @path
            )
          end

          test 'show renders lifecycle environment details' do
            execution_environment = FactoryBot.create(:execution_environment, organization: @organization)
            @environment.update!(execution_environment: execution_environment)

            get :show, params: { id: @environment.id, format: :json }, session: set_session_user

            assert_response :success
            response = JSON.parse(@response.body)
            assert_equal @environment.id, response['id']
            assert_equal @environment.name, response['name']
            assert_equal execution_environment.id, response['execution_environment']['id']
            assert_equal [], response['content']
          end

          test 'content renders assigned content with full details' do
            collection = FactoryBot.create(:ansible_collection, organization: @organization)
            version = FactoryBot.create(:content_unit_version, versionable: collection)
            role = FactoryBot.create(:ansible_collection_role, ansible_collection_version: version)
            FactoryBot.create(
              :lifecycle_environment_content_unit_version,
              lifecycle_environment: @environment,
              content_unit_version: version
            )

            get(
              :content,
              params: { id: @environment.id, full: true, format: :json },
              session: set_session_user
            )

            assert_response :success
            response = JSON.parse(@response.body)
            collection_response = response['content']['collections'].first
            assert_equal collection.id, collection_response['id']
            assert_equal collection.full_name, collection_response['identifier']
            assert_equal version.id, collection_response['versions'].first['id']
            assert_equal role.id, collection_response['versions'].first['roles'].first['id']
          end

          test 'create passes permitted params to service' do
            service_args = nil

            ::ForemanAnsibleDirector::LifecycleEnvironmentService.stub(
              :create_environment,
              ->(**args) {
                service_args = args
                @environment
              }
            ) do
              post(
                :create,
                params: {
                  organization_id: @organization.id,
                  lifecycle_environment_path_id: @path.id,
                  lifecycle_environment: {
                    name: 'Staging',
                    description: 'Staging environment',
                    position: 2,
                    ignored: 'value',
                  },
                  format: :json,
                },
                session: set_session_user
              )
            end

            assert_response :no_content
            assert_equal @path, service_args[:lce_path]
            assert_equal 'Staging', service_args[:name]
            assert_equal 'Staging environment', service_args[:description]
            assert_equal 2, service_args[:position].to_i
            assert_equal @organization.id, service_args[:organization_id]
            refute_includes service_args.keys, :ignored
          end

          test 'update passes permitted params to service' do
            execution_environment = FactoryBot.create(:execution_environment, organization: @organization)
            service_args = nil

            ::ForemanAnsibleDirector::LifecycleEnvironmentService.stub(
              :edit_environment,
              ->(**args) {
                service_args = args
                true
              }
            ) do
              put(
                :update,
                params: {
                  id: @environment.id,
                  lifecycle_environment: {
                    name: 'Production',
                    description: 'Production environment',
                    execution_environment_id: execution_environment.id,
                    ignored: 'value',
                  },
                  format: :json,
                },
                session: set_session_user
              )
            end

            assert_response :no_content
            assert_equal @environment, service_args[:environment]
            assert_equal 'Production', service_args[:name]
            assert_equal 'Production environment', service_args[:description]
            assert_equal execution_environment.id, service_args[:execution_environment_id].to_i
            refute_includes service_args.keys, :ignored
          end

          test 'update_content passes content assignments to service for root environment' do
            execution_environment = FactoryBot.create(:execution_environment, organization: @organization)
            collection = FactoryBot.create(:ansible_collection, organization: @organization)
            service_args = nil

            ::ForemanAnsibleDirector::LifecycleEnvironmentService.stub(
              :assign_content,
              ->(environment, content_assignments, execution_environment_id) {
                service_args = {
                  environment: environment,
                  content_assignments: content_assignments,
                  execution_environment_id: execution_environment_id,
                }
                true
              }
            ) do
              patch(
                :update_content,
                params: {
                  id: @environment.id,
                  organization_id: @organization.id,
                  execution_environment_id: execution_environment.id,
                  content_assignments: [
                    {
                      id: collection.id,
                      version: '1.0.0',
                      ignored: 'value',
                    },
                  ],
                  format: :json,
                },
                session: set_session_user
              )
            end

            assert_response :no_content
            assert_equal @environment, service_args[:environment]
            assert_equal execution_environment.id, service_args[:execution_environment_id].to_i
            assert_equal collection.id, service_args[:content_assignments].first[:id].to_i
            assert_equal '1.0.0', service_args[:content_assignments].first[:version]
            refute service_args[:content_assignments].first.key?(:ignored)
          end

          test 'assign resolves host target and calls service' do
            host = nil
            service_target = nil
            assigned_environment = nil
            as_admin do
              host = FactoryBot.create(:host, organization: @organization)
            end

            ::ForemanAnsibleDirector::LifecycleEnvironmentService.stub(
              :assign,
              ->(environment, target_record) {
                assigned_environment = environment
                service_target = target_record
                true
              }
            ) do
              post(
                :assign,
                params: {
                  id: @environment.id,
                  target_type: 'HOST',
                  target_id: host.id,
                  format: :json,
                },
                session: set_session_user
              )
            end

            assert_response :no_content
            assert_equal @environment, assigned_environment
            assert_equal host, service_target
          end

          test 'assign none updates target state through service' do
            target = nil
            service_target = nil
            as_admin do
              target = FactoryBot.create(:host, organization: @organization)
            end

            ::ForemanAnsibleDirector::LifecycleEnvironmentService.stub(
              :assign_none,
              ->(target:) {
                service_target = target
                true
              }
            ) do
              post(
                :assign,
                params: {
                  id: 'none',
                  target_type: 'HOST',
                  target_id: target.id,
                  format: :json,
                },
                session: set_session_user
              )
            end

            assert_response :no_content
            assert_equal target, service_target
          end

          test 'destroy delegates to service' do
            destroyed_environment = nil

            ::ForemanAnsibleDirector::LifecycleEnvironmentService.stub(
              :destroy_environment,
              ->(environment) {
                destroyed_environment = environment
                true
              }
            ) do
              delete :destroy, params: { id: @environment.id, format: :json }, session: set_session_user
            end

            assert_response :no_content
            assert_equal @environment, destroyed_environment
          end
        end
      end
    end
  end
end
