# frozen_string_literal: true

module ForemanAnsibleDirector
  class AnsibleContentAssignment < ::ForemanAnsibleDirector::AnsibleDirectorModel
    belongs_to :consumable, polymorphic: true

    validate :assignment_unique_for_consumable

    def assignment_unique_for_consumable
      found = consumable.ansible_content_assignments.where(
        assignable_type: self[:assignable_type],
        assignable_name: self[:assignable_name],
        assignable_namespace: self[:assignable_namespace],
        assignable_role_name: self[:assignable_role_name]
      )

      return unless found.count.positive?

      fqrn = if self[:assignable_type] == 'ForemanAnsibleDirector::AnsibleCollectionRole'
               "#{self[:assignable_namespace]}.#{self[:assignable_name]}.#{self[:assignable_role_name]}"
             else
               "#{self[:assignable_namespace]}.#{self[:assignable_name]}"
             end

      errors.add(:uniqueness_per_consumable, "#{fqrn} is already assigned to #{consumable.cr_name}.")
    end
  end
end
