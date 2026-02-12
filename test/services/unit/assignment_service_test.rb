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
            assignment = ::ForemanAnsibleDirector::AssignmentService.create_assignment(
              consumable: @collection_role,
              assignable: @lifecycle_environment
            )

            assert_not_nil assignment
            assert_equal @collection_role, assignment.consumable
            assert_equal @lifecycle_environment, assignment.assignable
          end
        end

        describe '#destroy_assignment' do
          setup do
            @assignment = FactoryBot.create(
              :ansible_content_assignment,
              consumable: @collection_role,
              assignable: @lifecycle_environment
            )
          end

          test 'destroys assignment' do
            assignment_id = @assignment.id

            ::ForemanAnsibleDirector::AssignmentService.destroy_assignment(@assignment)

            assert_nil ::ForemanAnsibleDirector::AnsibleContentAssignment.find_by(id: assignment_id)
          end
        end

        describe '#create_bulk_assignments' do
          test 'creates multiple assignments in a single transaction' do
            collection2 = FactoryBot.create(:ansible_collection, organization: @organization)
            collection_version2 = FactoryBot.create(:content_unit_version, :for_collection, versionable: collection2)
            collection_role2 = FactoryBot.create(:ansible_collection_role, ansible_collection_version: collection_version2)

            assignments = [
              { source: { type: 'ACR', id: @collection_role.id }, target: { type: 'HOST', id: @host.id } },
              { source: { type: 'ACR', id: collection_role2.id }, target: { type: 'HOST', id: @host.id } }
            ]

            ::ForemanAnsibleDirector::AssignmentService.create_bulk_assignments(assignments: assignments)

            target_assignments = ::ForemanAnsibleDirector::AnsibleContentAssignment.where(
              assignable: @host
            )
            assert_equal 2, target_assignments.count
          end

          test 'clears existing assignments for a target before creating new ones' do
            FactoryBot.create(
              :ansible_content_assignment,
              consumable: @collection_role,
              assignable: @lifecycle_environment
            )
            assert_equal 1, ::ForemanAnsibleDirector::AnsibleContentAssignment.where(assignable: @lifecycle_environment).count

            collection2 = FactoryBot.create(:ansible_collection, organization: @organization)
            collection_version2 = FactoryBot.create(:content_unit_version, :for_collection, versionable: collection2)
            collection_role2 = FactoryBot.create(:ansible_collection_role, ansible_collection_version: collection_version2)

            FactoryBot.create(
              :ansible_content_assignment,
              consumable: @collection_role,
              assignable: @host
            )

            assignments = [
              { source: { type: 'ACR', id: collection_role2.id }, target: { type: 'HOST', id: @host.id } }
            ]

            ::ForemanAnsibleDirector::AssignmentService.create_bulk_assignments(assignments: assignments)

            target_assignments = ::ForemanAnsibleDirector::AnsibleContentAssignment.where(
              assignable: @host
            )
            assert_equal 1, target_assignments.count
            assert_equal collection_role2, target_assignments.first.consumable
          end

          test 'only clears a target once when it appears in multiple assignments' do
            collection2 = FactoryBot.create(:ansible_collection, organization: @organization)
            collection_version2 = FactoryBot.create(:content_unit_version, :for_collection, versionable: collection2)
            collection_role2 = FactoryBot.create(:ansible_collection_role, ansible_collection_version: collection_version2)

            assignments = [
              { source: { type: 'ACR', id: @collection_role.id }, target: { type: 'HOST', id: @host.id } },
              { source: { type: 'ACR', id: collection_role2.id }, target: { type: 'HOST', id: @host.id } }
            ]

            ::ForemanAnsibleDirector::AssignmentService.create_bulk_assignments(assignments: assignments)

            target_assignments = ::ForemanAnsibleDirector::AnsibleContentAssignment.where(
              assignable: @host
            )
            assert_equal 2, target_assignments.count
          end
        end

        describe '#finder' do
          test 'returns AnsibleCollectionRole for ACR type' do
            result = ::ForemanAnsibleDirector::AssignmentService.finder(type: 'ACR')
            assert_equal ::ForemanAnsibleDirector::AnsibleCollectionRole, result
          end

          test 'returns ContentUnitVersion for CONTENT type' do
            result = ::ForemanAnsibleDirector::AssignmentService.finder(type: 'CONTENT')
            assert_equal ::ForemanAnsibleDirector::ContentUnitVersion, result
          end

          test 'returns Host::Managed for HOST type' do
            result = ::ForemanAnsibleDirector::AssignmentService.finder(type: 'HOST')
            assert_equal Host::Managed, result
          end

          test 'returns Hostgroup for HOSTGROUP type' do
            result = ::ForemanAnsibleDirector::AssignmentService.finder(type: 'HOSTGROUP')
            assert_equal Hostgroup, result
          end

        end

        describe '#find_target' do

          test 'finds an ACR target' do
            result = ::ForemanAnsibleDirector::AssignmentService.find_target(
              target_type: 'ACR',
              target_id: @collection_role.id
            )

            assert_equal @collection_role, result
          end

          test 'finds a CONTENT target' do
            result = ::ForemanAnsibleDirector::AssignmentService.find_target(
              target_type: 'CONTENT',
              target_id: @collection_version.id
            )

            assert_equal @collection_version, result
          end


          test 'finds a HOST target' do
            result = ::ForemanAnsibleDirector::AssignmentService.find_target(
              target_type: 'HOST',
              target_id: @host.id
            )

            assert_equal @host, result
          end


          test 'finds a HOSTGROUP target' do

            as_admin do
              @hostgroup = FactoryBot.create(:hostgroup, organizations: [@organization])

            result = ::ForemanAnsibleDirector::AssignmentService.find_target(
              target_type: 'HOSTGROUP',
              target_id: @hostgroup.id
            )
              assert_equal @hostgroup, result
            end

          end

        end

      end
    end
  end
end
