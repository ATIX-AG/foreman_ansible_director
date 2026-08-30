require 'foreman_ansible_director_test_helper'

module ForemanAnsibleDirectorTests
  module Services
    module Unit
      class AssignmentServiceTest < ForemanAnsibleDirectorTestCase

        setup do
          @collection = FactoryBot.create(:ansible_collection, organization: @organization)
          @collection_version = FactoryBot.create(:content_unit_version, :for_collection, versionable: @collection)
          @collection_role = FactoryBot.create(:ansible_collection_role, ansible_collection_version: @collection_version)
          @path = FactoryBot.create(:lifecycle_environment_path, organization: @organization)
          @lifecycle_environment = FactoryBot.create(:lifecycle_environment, organization: @organization, lifecycle_environment_path: @path)
          as_admin do
            @host = FactoryBot.create(:host)
          end
        end

        describe '#create_assignment' do
          test 'creates an assignment with valid params' do
            acr_assignment = ::ForemanAnsibleDirector::AssignmentService.create_assignment(
              target: @host,
              assignment: {
                assignable_type: "ForemanAnsibleDirector::AnsibleCollectionRole",
                assignable_namespace: "manala",
                assignable_name: "roles",
                assignable_role_name: "motd"
              }
            )

            ac_assignment = ::ForemanAnsibleDirector::AssignmentService.create_assignment(
              target: @host,
              assignment: {
                assignable_type: "ForemanAnsibleDirector::AnsibleRole",
                assignable_namespace: "geerlinguy",
                assignable_name: "redis",
              }
            )

            assert_not_nil acr_assignment
            assert_not_nil ac_assignment
          end
        end

        describe '#destroy_assignment' do
          setup do
            @assignment = FactoryBot.create(
              :ansible_content_assignment,
              consumable: @host
            )
          end

          test 'destroys assignment' do
            assignment_id = @assignment.id

            ::ForemanAnsibleDirector::AssignmentService.destroy_assignment(@assignment)

            assert_nil ::ForemanAnsibleDirector::AnsibleContentAssignment.find_by(id: assignment_id)
          end
        end

        describe '#create_bulk_assignments' do
          test 'creates multiple assignments for a target' do

            assignments = [
              {
                assignable_type: "ForemanAnsibleDirector::AnsibleCollectionRole",
                assignable_namespace: "manala",
                assignable_name: "roles",
                assignable_role_name: "motd"
              },
              {
                assignable_type: "ForemanAnsibleDirector::AnsibleRole",
                assignable_namespace: "geerlingguy",
                assignable_name: "redis",
              }
            ]

            ::ForemanAnsibleDirector::AssignmentService.create_bulk_assignments(target: @host, assignments: assignments)

            target_assignments = ::ForemanAnsibleDirector::AnsibleContentAssignment.where(
              consumable: @host
            )
            assert_equal 2, target_assignments.count
          end

          test 'does nothing for empty assignments' do
            existing_assignment = FactoryBot.create(
              :ansible_content_assignment,
              consumable: @host
            )

            ::ForemanAnsibleDirector::AssignmentService.create_bulk_assignments(target: @host, assignments: [])

            assert_equal(
              [existing_assignment.id],
              ::ForemanAnsibleDirector::AnsibleContentAssignment.where(consumable: @host).pluck(:id)
            )
          end

          test 'rolls back all target changes when a later assignment fails' do
            existing_assignment = FactoryBot.create(
              :ansible_content_assignment,
              consumable: @host
            )

            assert_raises(ActiveRecord::StatementInvalid) do
              ::ForemanAnsibleDirector::AssignmentService.create_bulk_assignments(
                target: @host,
                assignments: [
                  {
                    assignable_type: "ForemanAnsibleDirector::AnsibleRole",
                    assignable_namespace: "geerlinguy",
                    assignable_name: "redis",
                  },
                  {
                    assignable_type: "ForemanAnsibleDirector::AnsibleRole",
                    assignable_namespace: "geerlinguy",
                    assignable_name: nil,
                  }
                ]
              )
            end

            assert_equal(
              [existing_assignment.id],
              ::ForemanAnsibleDirector::AnsibleContentAssignment.where(consumable: @host).pluck(:id)
            )
          end
        end

        describe "#content_source_for" do

          setup do
            @lifecycle_environment_path = FactoryBot.create(:lifecycle_environment_path, organization: @organization)
            @lifecycle_environment = FactoryBot.create(
              :lifecycle_environment,
              organization: @organization,
              lifecycle_environment_path: @lifecycle_environment_path
            )

            as_admin do
              @target_hostgroup = FactoryBot.create(
                :hostgroup, organizations: [@organization],
                ansible_lifecycle_environment: @lifecycle_environment,
              )
              @target_host = FactoryBot.create(
                :host,
                hostgroup: @target_hostgroup
              )
            end
          end

          test 'recursively resolves content source' do

            content_source, hieararchy = ::ForemanAnsibleDirector::AssignmentService.content_source_for(@target_host)

            assert_equal @lifecycle_environment, content_source
            assert_equal [@target_host, @target_hostgroup], hieararchy

          end
        end

        describe '#assignments_for' do

          setup do
            @lifecycle_environment_path = FactoryBot.create(:lifecycle_environment_path, organization: @organization)
            @lifecycle_environment = FactoryBot.create(
              :lifecycle_environment,
              organization: @organization,
              lifecycle_environment_path: @lifecycle_environment_path
            )

            as_admin do
              @target_parent_hostgroup = FactoryBot.create(:hostgroup, organizations: [@organization])
              @target_child_hostgroup = FactoryBot.create(:hostgroup, organizations: [@organization])
              @target_child_hostgroup.update(parent: @target_parent_hostgroup)
              @target_child_hostgroup.reload
              @target_host = FactoryBot.create(
                :host,
                ansible_lifecycle_environment: @lifecycle_environment,
                hostgroup: @target_child_hostgroup
              )
            end

            @assignment = FactoryBot.create(
              :ansible_content_assignment,
              consumable: @host
            )
            @collection_1 = FactoryBot.create(:ansible_collection, organization: @organization)
            @collection_2 = FactoryBot.create(:ansible_collection, organization: @organization)
            @collection_version_1_1 = FactoryBot.create(:content_unit_version, :for_collection, versionable: @collection_1)
            @collection_version_2_1 = FactoryBot.create(:content_unit_version, :for_collection, versionable: @collection_2)
            @collection_role_1_1_1 = FactoryBot.create(:ansible_collection_role, ansible_collection_version: @collection_version_1_1)
            @collection_role_2_1_1 = FactoryBot.create(:ansible_collection_role, ansible_collection_version: @collection_version_2_1)

            @role_1 = FactoryBot.create(:ansible_role, organization: @organization)
            @role_version_1_1 = FactoryBot.create(:content_unit_version, :for_role, versionable: @role_1)

          end

          test 'recursively queries assignments for target with no parent' do

            @assignment_1 = FactoryBot.create(
              :ansible_content_assignment,
              consumable: @target_host,
              assignable_namespace: @collection_1.namespace,
              assignable_name: @collection_1.name,
              assignable_role_name: @collection_role_1_1_1.name
            )

            @assignment_2 = FactoryBot.create(
              :ansible_content_assignment,
              consumable: @target_host,
              assignable_namespace: @collection_2.namespace,
              assignable_name: @collection_2.name,
              assignable_role_name: @collection_role_2_1_1.name
            )

            assignments, = ::ForemanAnsibleDirector::AssignmentService.assignments_for(target: @target_host, resolve: false)

            assert_equal 2, assignments.length
          end

          test 'recursively queries assignments for target with parents' do

            @assignment_1 = FactoryBot.create(
              :ansible_content_assignment,
              consumable: @target_parent_hostgroup,
              assignable_namespace: @collection_1.namespace,
              assignable_name: @collection_1.name,
              assignable_role_name: @collection_role_1_1_1.name
            )

            @assignment_2 = FactoryBot.create(
              :ansible_content_assignment,
              consumable: @target_child_hostgroup,
              assignable_namespace: @collection_2.namespace,
              assignable_name: @collection_2.name,
              assignable_role_name: @collection_role_2_1_1.name
            )

            @assignment_3 = FactoryBot.create(
              :ansible_content_assignment,
              :for_role,
              consumable: @target_host,
              assignable_namespace: @role_1.namespace,
              assignable_name: @role_1.name
            )

            # For some reason, FactoryBot does not want to build @target_child_hostgroup with @target_parent_hostgroup
            # as its parent.
            @target_child_hostgroup.stub(:parent, -> { @target_parent_hostgroup }) do
              assignments, = ::ForemanAnsibleDirector::AssignmentService.assignments_for(target: @target_host, resolve: false)
              assert_equal 3, assignments.length
            end
          end

          test 'resolves concrete content units for assignments' do

            FactoryBot.create(
              :lifecycle_environment_content_unit_version,
              lifecycle_environment: @lifecycle_environment,
              content_unit_version: @collection_version_1_1
            )
            FactoryBot.create(
              :lifecycle_environment_content_unit_version,
              lifecycle_environment: @lifecycle_environment,
              content_unit_version: @collection_version_2_1
            )
            FactoryBot.create(
              :lifecycle_environment_content_unit_version,
              lifecycle_environment: @lifecycle_environment,
              content_unit_version: @role_version_1_1
            )

            @assignment_1 = FactoryBot.create(
              :ansible_content_assignment,
              consumable: @target_parent_hostgroup,
              assignable_namespace: @collection_1.namespace,
              assignable_name: @collection_1.name,
              assignable_role_name: @collection_role_1_1_1.name
            )

            @assignment_2 = FactoryBot.create(
              :ansible_content_assignment,
              consumable: @target_child_hostgroup,
              assignable_namespace: @collection_2.namespace,
              assignable_name: @collection_2.name,
              assignable_role_name: @collection_role_2_1_1.name
            )

            @assignment_3 = FactoryBot.create(
              :ansible_content_assignment,
              :for_role,
              consumable: @target_host,
              assignable_namespace: @role_1.namespace,
              assignable_name: @role_1.name
            )

            # For some reason, FactoryBot does not want to build @target_child_hostgroup with @target_parent_hostgroup
            # as its parent.
            @target_child_hostgroup.stub(:parent, -> { @target_parent_hostgroup }) do
              assignments, resolved_assignments, hierarchy = ::ForemanAnsibleDirector::AssignmentService.assignments_for(target: @target_host, resolve: true)
              assert_equal 3, assignments.length
              assert_equal [@assignment_1, @assignment_2, @assignment_3], assignments

              assert_equal 3, resolved_assignments.length
              assert_equal [@collection_role_1_1_1, @collection_role_2_1_1, @role_version_1_1], resolved_assignments.pluck(:cuv)

              assert_equal 3, hierarchy.length
              assert_equal [@target_host, @target_child_hostgroup, @target_parent_hostgroup], hierarchy
            end
          end

          test 'issues warning when an unresolvable assignment is encountered' do
            @assignment_2 = FactoryBot.create(
              :ansible_content_assignment,
              consumable: @target_child_hostgroup,
              assignable_namespace: @collection_2.namespace,
              assignable_name: @collection_2.name,
              assignable_role_name: @collection_role_2_1_1.name
            )

            @assignment_3 = FactoryBot.create(
              :ansible_content_assignment,
              :for_role,
              consumable: @target_host,
              assignable_namespace: @role_1.namespace,
              assignable_name: @role_1.name
            )

            ::ForemanAnsibleDirector::AssignmentService.assignments_for(target: @target_host, resolve: true)
            assert_equal 2, ctx.warnings.length
          end

        end

        describe '#finder' do

          test 'returns Host for "host" type' do
            result = ::ForemanAnsibleDirector::AssignmentService.finder(type: 'host')
            assert_equal Host, result
          end

          test 'returns Hostgroup for "hostgroup" type' do
            result = ::ForemanAnsibleDirector::AssignmentService.finder(type: 'hostgroup')
            assert_equal Hostgroup, result
          end

          test 'raises error for invalid type' do
            assert_raises(RuntimeError, 'Invalid type: UNKNOWN') do
              ::ForemanAnsibleDirector::AssignmentService.finder(type: 'UNKNOWN')
            end
          end
        end

        describe '#find_target' do

          test 'finds a "host" target' do
            result = ::ForemanAnsibleDirector::AssignmentService.find_target(
              target_type: 'host',
              target_id: @host.id
            )

            assert_equal @host, result
          end

          test 'finds a "hostgroup" target' do

            as_admin do
              @hostgroup = FactoryBot.create(:hostgroup, organizations: [@organization])

              result = ::ForemanAnsibleDirector::AssignmentService.find_target(
                target_type: 'hostgroup',
                target_id: @hostgroup.id
              )
              assert_equal @hostgroup, result
            end

          end

          test 'raises exception for non-existent target' do
            assert_raises(ActiveRecord::RecordNotFound) do
              ::ForemanAnsibleDirector::AssignmentService.find_target(
                target_type: 'hostgroup',
                target_id: -1
              )
            end
          end
        end

      end
    end
  end
end
