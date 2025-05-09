# frozen_string_literal: true

class AddOrgSupport < ActiveRecord::Migration[6.1]
  def change
    add_column :pulsible_ansible_collections, :organization_id, :integer
    add_column :pulsible_ansible_roles, :organization_id, :integer
    add_column :pulsible_execution_environments, :organization_id, :integer

    add_foreign_key :pulsible_ansible_collections, :taxonomies, column: :organization_id
    add_foreign_key :pulsible_ansible_roles, :taxonomies, column: :organization_id
    add_foreign_key :pulsible_execution_environments, :taxonomies, column: :organization_id
  end
end
