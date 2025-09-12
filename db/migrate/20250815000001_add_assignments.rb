# frozen_string_literal: true

class AddAssignments < ActiveRecord::Migration[6.1]
  def change
    create_table :pulsible_ansible_content_assignments do |t|
      t.references :assignable, polymorphic: true, null: false
      t.references :consumable, polymorphic: true, null: false, index: { name: 'idx_pulsible_cuv' }
      t.boolean :subtractive, default: false
      t.timestamps
    end

    add_reference :hosts, :ansible_lifecycle_environment, foreign_key: { to_table: :pulsible_lifecycle_environments }

  end
end
