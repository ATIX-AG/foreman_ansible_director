# frozen_string_literal: true

require 'foreman_ansible_director_test_helper'
require 'dynflow/testing'

module ForemanAnsibleDirectorTests
  module Actions
    module Unit
      class IndexStaticTest < ForemanAnsibleDirectorTestCase
        include Dynflow::Testing

        ACTION_CLASS = ::ForemanAnsibleDirector::Actions::AnsibleContentUnit::Index::IndexStatic
        REMOTE_DESTROY = ::ForemanAnsibleDirector::Pulp3::Ansible::Remote::Collection::Destroy
        DISTRIBUTION_DESTROY = ::ForemanAnsibleDirector::Pulp3::Ansible::Distribution::Destroy
        REPOSITORY_DESTROY = ::ForemanAnsibleDirector::Pulp3::Ansible::Repository::Destroy

        BASE_INPUT = {
          repository_href: '/pulp/api/v3/repositories/ansible/ansible/1/',
          remote_href: '/pulp/api/v3/remotes/ansible/collection/1/',
          distribution_href: '/pulp/api/v3/distributions/ansible/ansible/1/',
          content_unit_type: 'collection',
          content_unit_source: 'https://galaxy.ansible.com/',
          unit_name: 'operations',
          unit_namespace: 'theforeman',
          index_mode: 'import',
          repository_show_action_output: {
            repository_show_response: { latest_version_href: '/pulp/.../versions/1/' },
          },
        }.freeze

        # Builds a Run-phase action directly so #run/#finalize can be exercised without going
        # through IndexStatic's own #plan (which plans several nested sub-actions unrelated to
        # the behaviour under test).
        def build_action(extract_variables_response:)
          execution_plan = Dynflow::Testing::DummyExecutionPlan.new
          step = Dynflow::Testing::DummyStep.new
          ACTION_CLASS.new(
            { step: step,
              execution_plan_id: execution_plan.id,
              id: Dynflow::Testing.get_id,
              phase: Dynflow::Action::Run,
              plan_step_id: step.id,
              run_step_id: step.id,
              finalize_step_id: nil,
              input: BASE_INPUT.merge(
                organization_id: @organization.id,
                extract_variables_action_output: { extract_variables_response: extract_variables_response }
              ),
              output: {} },
            execution_plan.world
          )
        end

        def finalize(action)
          finalize_action = ACTION_CLASS.new(
            { step: Dynflow::Testing::DummyStep.new,
              execution_plan_id: action.execution_plan_id,
              id: action.id,
              phase: Dynflow::Action::Finalize,
              plan_step_id: action.plan_step_id,
              run_step_id: action.run_step_id,
              finalize_step_id: Dynflow::Testing::DummyStep.new.id,
              input: action.input },
            action.world
          )
          finalize_action.execute
          finalize_action
        end

        test 'cleans up orphaned Pulp objects and skips record creation when nothing was imported' do
          REMOTE_DESTROY.expects(:new).with(BASE_INPUT[:remote_href]).returns(stub(request: nil))
          DISTRIBUTION_DESTROY.expects(:new).with(BASE_INPUT[:distribution_href]).returns(stub(request: nil))
          REPOSITORY_DESTROY.expects(:new).with(BASE_INPUT[:repository_href]).returns(stub(request: nil))
          ::ForemanAnsibleDirector::ContentService.expects(:create_ansible_collection).never

          action = build_action(extract_variables_response: {})
          action.run

          assert_equal [], action.output[:indexed_unit_versions]

          finalize(action)

          assert_nil ::ForemanAnsibleDirector::AnsibleCollection.find_by(
            name: 'operations', namespace: 'theforeman', organization_id: @organization.id
          )
        end

        test 'does not attempt cleanup when a destroy fails, and logs instead of raising' do
          REMOTE_DESTROY.expects(:new).raises(StandardError, 'boom')
          DISTRIBUTION_DESTROY.expects(:new).with(BASE_INPUT[:distribution_href]).returns(stub(request: nil))
          REPOSITORY_DESTROY.expects(:new).with(BASE_INPUT[:repository_href]).returns(stub(request: nil))

          action = build_action(extract_variables_response: {})
          action.run

          assert_nothing_raised { finalize(action) }
        end

        test 'creates the unit record and skips cleanup when content was imported' do
          REMOTE_DESTROY.expects(:new).never
          DISTRIBUTION_DESTROY.expects(:new).never
          REPOSITORY_DESTROY.expects(:new).never

          action = build_action(extract_variables_response: { '1.0.0' => {} })
          action.run

          assert_equal [{ 'version' => '1.0.0', 'collection_roles' => [] }], action.output[:indexed_unit_versions]

          finalize(action)

          unit = ::ForemanAnsibleDirector::AnsibleCollection.find_by(
            name: 'operations', namespace: 'theforeman', organization_id: @organization.id
          )
          refute_nil unit
          assert_equal ['1.0.0'], unit.content_unit_versions.map(&:version)
        end
      end
    end
  end
end
