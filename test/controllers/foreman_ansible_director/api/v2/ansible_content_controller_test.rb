# frozen_string_literal: true

require 'foreman_ansible_director_test_helper'

module ForemanAnsibleDirectorTests
  module Controllers
    module Api
      module V2
        class AnsibleContentControllerTest < ActionController::TestCase
          tests ::ForemanAnsibleDirector::Api::V2::AnsibleContentController

          Task = Struct.new(:id, :label, :started_at)
          ContentUnit = Struct.new(:id, :name, :namespace, :type, :content_unit_versions) do
            def full_name
              "#{namespace}.#{name}"
            end
          end
          ContentUnitVersion = Struct.new(:id, :version, :ansible_collection_roles)
          CollectionRole = Struct.new(:id, :name, :ansible_variables)
          AnsibleVariable = Struct.new(:id, :key, :default_value, :key_type) do
            def overridable?
              false
            end
          end
          ContentScope = Struct.new(:records) do
            def where(conditions)
              records.select { |record| record.organization_id == conditions[:organization_id] }
            end
          end

          setup do
            @routes = ActionDispatch::Routing::RouteSet.new
            @routes.draw do
              get 'ansible_content', to: 'foreman_ansible_director/api/v2/ansible_content#index'
              post 'ansible_content', to: 'foreman_ansible_director/api/v2/ansible_content#create_units'
              delete 'ansible_content', to: 'foreman_ansible_director/api/v2/ansible_content#destroy_units'
              get 'ansible_content/:version', to: 'foreman_ansible_director/api/v2/ansible_content#version_detail'
              post 'ansible_content/consistency_check',
                to: 'foreman_ansible_director/api/v2/ansible_content#consistency_check'
            end
            User.current = User.find_by(login: 'admin')
            @organization = Organization.find_by(name: 'Organization 1')
            Organization.current = @organization
          end

          test 'index lists content units for organization' do
            organization_id = @organization.id
            version = ContentUnitVersion.new(10, '1.0.0', [])
            collection = ContentUnit.new(
              20,
              'operations',
              'theforeman',
              'ForemanAnsibleDirector::AnsibleCollection',
              [version]
            )
            collection.define_singleton_method(:organization_id) { organization_id }
            hidden_collection = ContentUnit.new(
              30,
              'hidden',
              'theforeman',
              'ForemanAnsibleDirector::AnsibleCollection',
              []
            )
            hidden_collection.define_singleton_method(:organization_id) { -1 }

            @controller.stub(:resource_scope_for_index, ContentScope.new([collection, hidden_collection])) do
              get :index, params: { organization_id: @organization.id, format: :json }, session: set_session_user
            end

            assert_response :success
            response = JSON.parse(@response.body)
            units = response.is_a?(Array) ? response : response['results']
            assert_equal [collection.id], units.map { |unit| unit['id'] }
            assert_equal 'collection', units.first['type']
            assert_equal collection.full_name, units.first['identifier']
            assert_equal [version.id], units.first['versions'].map { |unit_version| unit_version['id'] }
            refute_includes units.map { |unit| unit['id'] }, hidden_collection.id
          end

          test 'create_units triggers bulk import with resolved content units' do
            triggered_action = nil
            triggered_args = nil
            task = Task.new(123, 'Import Ansible content', Time.zone.now)

            ::ForemanAnsibleDirector::ActionService.stub(
              :trigger,
              ->(action_class, task_args: {}, mode: :auto) {
                triggered_action = action_class
                triggered_args = task_args
                task
              }
            ) do
              post(
                :create_units,
                params: {
                  organization_id: @organization.id,
                  units: [
                    {
                      unit_name: 'theforeman.operations',
                      unit_type: 'collection',
                      unit_source_type: 'galaxy',
                      unit_source: 'https://galaxy.example.com',
                      unit_versions: ['1.0.0'],
                    },
                  ],
                  format: :json,
                },
                session: set_session_user
              )
            end

            assert_response :success
            assert_equal ::ForemanAnsibleDirector::Actions::AnsibleContentUnit::Bulk::Import, triggered_action
            assert_equal @organization.id, triggered_args[:organization_id]

            resolved_unit = triggered_args[:resolved_content_units].first
            assert_equal :collection, resolved_unit.unit_type
            assert_equal 'theforeman.operations', resolved_unit.name
            assert_equal :galaxy, resolved_unit.source_type
            assert_equal 'https://galaxy.example.com', resolved_unit.source
            assert_equal ['1.0.0'], resolved_unit.versions

            response = JSON.parse(@response.body)
            assert_equal task.id, response['results']['task']['id']
            assert_equal task.label, response['results']['task']['label']
          end

          test 'destroy_units triggers bulk destroy with resolved content units' do
            collection_id = 20
            version_id = 10
            resolved_content_units = {
              collection_id => {
                versions: {
                  galaxy: [version_id],
                  git: [],
                },
                complete: true,
              },
            }
            triggered_action = nil
            triggered_args = nil
            task = Task.new(456, 'Destroy Ansible content', Time.zone.now)

            ::ForemanAnsibleDirector::AnsibleContent::AnsibleContentHelpers.stub(
              :resolve_destroy_payload,
              resolved_content_units
            ) do
              ::ForemanAnsibleDirector::ActionService.stub(
                :trigger,
                ->(action_class, task_args: {}, mode: :auto) {
                  triggered_action = action_class
                  triggered_args = task_args
                  task
                }
              ) do
                delete(
                  :destroy_units,
                  params: {
                    units: [
                      {
                        unit_id: collection_id,
                        unit_version_ids: [version_id],
                      },
                    ],
                    format: :json,
                  },
                  session: set_session_user
                )
              end
            end

            assert_response :success
            assert_equal ::ForemanAnsibleDirector::Actions::AnsibleContentUnit::Bulk::Destroy, triggered_action
            assert_equal resolved_content_units, triggered_args[:resolved_content_units]

            response = JSON.parse(@response.body)
            assert_equal task.id, response['results']['task']['id']
            assert_equal task.label, response['results']['task']['label']
          end

          test 'version_detail exposes collection roles and variables' do
            variable = AnsibleVariable.new(40, 'package_name', 'foreman', 'string')
            role = CollectionRole.new(30, 'server', [variable])
            version = ContentUnitVersion.new(10, '1.0.0', [role])

            ::ForemanAnsibleDirector::ContentUnitVersion.stub(:find_by, version) do
              get :version_detail, params: { version: version.id, format: :json }, session: set_session_user
            end

            assert_response :success
            response = JSON.parse(@response.body)
            assert_equal role.name, response['roles'].first['name']
            assert_equal variable.id, response['roles'].first['variables'].first['id']
            assert_equal 'package_name', response['roles'].first['variables'].first['name']
            assert_equal 'foreman', response['roles'].first['variables'].first['default_value']
            assert_equal 'string', response['roles'].first['variables'].first['type']
          end

          test 'consistency_check triggers consistency check action' do
            triggered_action = nil
            task = Task.new(789, 'Consistency check', Time.zone.now)

            ::ForemanAnsibleDirector::ActionService.stub(
              :trigger,
              ->(action_class, task_args: {}, mode: :auto) {
                triggered_action = action_class
                task
              }
            ) do
              post :consistency_check, params: { format: :json }, session: set_session_user
            end

            assert_response :success
            assert_equal ::ForemanAnsibleDirector::Actions::ConsistencyCheck::Perform, triggered_action

            response = JSON.parse(@response.body)
            assert_equal task.id, response['results']['task']['id']
            assert_equal task.label, response['results']['task']['label']
          end
        end
      end
    end
  end
end
