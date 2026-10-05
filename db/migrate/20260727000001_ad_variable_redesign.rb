# frozen_string_literal: true

class AdVariableRedesign < ActiveRecord::Migration[6.1]
  def up
    ansible_variable_ids = LookupKey.where(type: 'ForemanAnsibleDirector::AnsibleVariable').pluck(:id)

    if ansible_variable_ids.any?
      LookupValue.where(lookup_key_id: ansible_variable_ids).delete_all
      ForemanAnsibleDirector::AnsibleVariable.where(id: ansible_variable_ids).delete_all
    end

    remove_column :lookup_keys, :ownable_type
    remove_column :lookup_keys, :ownable_id

    create_table :ad_ansible_variables do |t|
      t.string :name, null: false
      t.text :description, null: true
      t.string :data_type, null: false
      t.integer :query, default: 0, null: false
      t.jsonb :query_data, default: {}, null: false
      t.integer :transformer, default: 0, null: false
      t.jsonb :transformer_data, default: {}, null: false
      t.text :raw_value, null: true
      t.references :ownable, polymorphic: true, null: false, index: true
      t.integer :organization_id, null: false
      t.timestamps
    end

    create_table :ad_ansible_variable_bindings do |t|
      t.string :data_type, null: false
      t.integer :query, default: 0, null: false
      t.jsonb :query_data, default: {}, null: false
      t.integer :transformer, default: 0, null: false
      t.jsonb :transformer_data, default: {}, null: false
      t.text :raw_value, null: true
      t.string :variable_name, null: false
      # This is the same key used to identify an A(C)RV.
      t.string :assignable_type, null: false
      t.string :assignable_namespace, null: false
      t.string :assignable_name, null: false
      t.string :assignable_role_name, null: true
      t.references :consumable, polymorphic: true, null: false, index: true
      t.integer :organization_id, null: false
      t.timestamps
    end
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end
