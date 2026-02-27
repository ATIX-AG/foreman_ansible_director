# frozen_string_literal: true

module ForemanAnsibleDirector
  class AssignmentService < ::ForemanAnsibleDirector::AnsibleDirectorService
    class << self
      def destroy_assignment(assignment)
        ActiveRecord::Base.transaction do
          assignment.destroy
        end
      end

      def create_assignment(consumable:,
                            assignable:)
        ActiveRecord::Base.transaction do
          ::ForemanAnsibleDirector::AnsibleContentAssignment.create!(
            consumable: consumable,
            assignable: assignable
          )
        end
      end

      def create_bulk_assignments(assignments:)
        cleared_targets = []
        ActiveRecord::Base.transaction do
          assignments.each do |assignment|
            source = find_target(target_type: assignment[:source][:type], target_id: assignment[:source][:id])
            target = find_target(target_type: assignment[:target][:type], target_id: assignment[:target][:id])

            unless target.id.in?(cleared_targets)
              ::ForemanAnsibleDirector::AnsibleContentAssignment.where(assignable: target).destroy_all
              cleared_targets.push(target.id)
            end
            ::ForemanAnsibleDirector::AnsibleContentAssignment.create!(consumable: source, assignable: target)
          end
        end
      end

      def finder(type:)
        error_scope(['ADR-003-005-004-001']).try do
          case type

          when 'ACR'
            ::ForemanAnsibleDirector::AnsibleCollectionRole
          when 'CONTENT'
            ::ForemanAnsibleDirector::ContentUnitVersion
          when 'HOST'
            Host::Managed
          when 'HOSTGROUP'
            Hostgroup
          else
            raise app_error_for('ADR-003-005-004-001', args: { type: type })
          end
        end
      end

      def find_target(target_type:, target_id:)
        finder = finder(type: target_type)
        error_scope(['ADR-003-005-005-001']).try do
          target = finder.find_by(id: target_id)
          unless target
            raise app_error_for('ADR-003-005-005-001', args: {
              target_type: target_type,
              target_id: target_id,
            })
          end
          target
        end
      end
    end
  end
end
