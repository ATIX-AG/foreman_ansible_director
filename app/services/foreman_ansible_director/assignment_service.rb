# frozen_string_literal: true

module ForemanAnsibleDirector
  class AssignmentService
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
            source_finder = ::ForemanAnsibleDirector::AssignmentService.finder(type: assignment[:source][:type])
            target_finder = ::ForemanAnsibleDirector::AssignmentService.finder(type: assignment[:target][:type])
            source = source_finder.find_by(id: assignment[:source][:id])
            target = target_finder.find_by(id: assignment[:target][:id])

            unless target.id.in?(cleared_targets)
              ::ForemanAnsibleDirector::AnsibleContentAssignment.where(assignable: target).destroy_all
              cleared_targets.push(target.id)
            end
            ::ForemanAnsibleDirector::AnsibleContentAssignment.create!(consumable: source, assignable: target)
          end
        end
      end

      def finder(type:)
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
          # TODO: Actual error message
          raise "Invalid type: #{type}"
        end
      end

      def find_target(target_type:, target_id:)
        # TODO: Null check target
        finder = finder(type: target_type)
        finder.find_by(id: target_id)
      end
    end
  end
end
