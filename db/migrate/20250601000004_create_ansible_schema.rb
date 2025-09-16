# frozen_string_literal: true

class CreateAnsibleSchema < ActiveRecord::Migration[6.1]
  def change
    create_table :ad_content_units do |t|
      t.string :name, null: false
      t.string :type, null: false
      t.string :namespace, null: false
      t.string :source, null: false
      t.text :description
      t.string :latest_version_href
      t.string :pulp_repository_href
      t.string :pulp_remote_href
      t.string :pulp_distribution_href
      t.integer :organization_id, null: false
      t.timestamps
    end

    add_foreign_key :ad_content_units, :taxonomies, column: :organization_id
    add_index :ad_content_units, :organization_id
    add_index :ad_content_units, %i[namespace name], unique: true
    add_index :ad_content_units, :type

    create_table :ad_content_unit_versions do |t|
      t.string :version, null: false
      t.references :versionable, polymorphic: true, null: false
      t.timestamps
    end

    add_index :ad_content_unit_versions,
      %i[versionable_type versionable_id version],
      unique: true,
      name: 'idx_ad_cuv_on_versionable_and_version'

    create_table :ad_ansible_collection_roles do |t|
      t.string :name, null: false
      t.integer :ansible_collection_version_id, null: false
      t.text :description
      t.timestamps
    end

    add_foreign_key :ad_ansible_collection_roles,
      :ad_content_unit_versions,
      column: :ansible_collection_version_id,
      name: 'fk_p_acr_on_acv_id'

    add_index :ad_ansible_collection_roles,
      %i[ansible_collection_version_id name],
      unique: true,
      name: 'idx_p_acr_on_acv_id_and_name'

    create_table :ad_execution_environments do |t|
      t.string :name, null: false
      t.string :base_image_url, null: false
      t.string :ansible_version, null: false
      t.integer :organization_id, null: false
      t.timestamps
    end

    add_foreign_key :ad_execution_environments, :taxonomies, column: :organization_id
    add_index :ad_execution_environments, :organization_id
    add_index :ad_execution_environments, :name

    create_table :ad_execution_environment_content_units do |t|
      t.integer :execution_environment_id, null: false
      t.integer :content_unit_id, null: false
      t.integer :content_unit_version_id, null: false
      t.timestamps
    end

    add_foreign_key :ad_execution_environment_content_units,
      :ad_execution_environments,
      column: :execution_environment_id,
      name: 'fk_p_eecu_on_ee_id'

    add_foreign_key :ad_execution_environment_content_units,
      :ad_content_units,
      column: :content_unit_id,
      name: 'fk_p_eecu_on_cu_id'

    add_foreign_key :ad_execution_environment_content_units,
      :ad_content_unit_versions,
      column: :content_unit_version_id,
      name: 'fk_p_eecu_on_cuv_id'

    add_index :ad_execution_environment_content_units,
      %i[execution_environment_id content_unit_id],
      unique: true,
      name: 'idx_p_eecu_on_ee_id_and_cu_id'

    create_table :ad_ansible_variables do |t|
      t.string :name, null: false
      t.text :default_value
      t.string :variable_type
      t.text :description
      t.integer :ansible_role_id, null: true
      t.integer :ansible_collection_role_id, null: true
      t.timestamps
    end

    # Foreign key references ad_content_units because AnsibleRole is STI
    add_foreign_key :ad_ansible_variables,
      :ad_content_units,
      column: :ansible_role_id,
      name: 'fk_p_av_on_ar_id'

    add_foreign_key :ad_ansible_variables,
      :ad_ansible_collection_roles,
      column: :ansible_collection_role_id,
      name: 'fk_p_av_on_acr_id'

    add_index :ad_ansible_variables,
      %i[name ansible_role_id],
      name: 'idx_p_av_on_name_and_ar_id',
      where: 'ansible_role_id IS NOT NULL'

    add_index :ad_ansible_variables,
      %i[name ansible_collection_role_id],
      name: 'idx_p_av_on_name_and_acr_id',
      where: 'ansible_collection_role_id IS NOT NULL'
  end
end
