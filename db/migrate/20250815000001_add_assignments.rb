# frozen_string_literal: true

class AddAssignments < ActiveRecord::Migration[6.1]
  def change
    create_table :ad_ansible_content_assignments do |t|
      t.references :assignable, polymorphic: true, null: false
      t.references :consumable, polymorphic: true, null: false, index: { name: 'idx_ad_cuv' }
      t.boolean :subtractive, default: false
      t.timestamps
    end

    add_reference :hosts, :ansible_lifecycle_environment, foreign_key: { to_table: :ad_lifecycle_environments }
  end
end
