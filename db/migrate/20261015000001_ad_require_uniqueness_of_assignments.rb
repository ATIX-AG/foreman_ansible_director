# frozen_string_literal: true

class AdRequireUniquenessOfAssignments < ActiveRecord::Migration[6.1]
  def change
    add_index :ad_ansible_content_assignments,
      %i[consumable_type consumable_id assignable_type assignable_name
         assignable_namespace assignable_role_name],
      unique: true,
      name: 'idx_ad_assignments_uniqueness'
  end
end
