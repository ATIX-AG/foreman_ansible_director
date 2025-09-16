# frozen_string_literal: true

class AddLifecycleEnvs < ActiveRecord::Migration[6.1]
  def change
    create_table :ad_content_snapshots do |t|
      t.integer :references, null: false
      t.string  :content_hash, null: false

      t.timestamps
    end

    create_table :ad_content_snapshot_content_unit_versions do |t|
      t.integer :content_snapshot_id, null: false
      t.integer :content_unit_version_id, null: false

      t.timestamps
    end

    add_foreign_key :ad_content_snapshot_content_unit_versions, :ad_content_snapshots,
      column: :content_snapshot_id, name: 'fk_ad_cscuv_cs_id'
    add_foreign_key :ad_content_snapshot_content_unit_versions, :ad_content_unit_versions,
      column: :content_unit_version_id, name: 'fk_ad_cscuv_cuv_id'

    add_index :ad_content_snapshot_content_unit_versions,
      %i[content_snapshot_id content_unit_version_id],
      unique: true,
      name: 'idx_ad_cscuv_unique'
    add_index :ad_content_snapshot_content_unit_versions,
      :content_snapshot_id,
      name: 'idx_ad_cscuv_cs_id'
    add_index :ad_content_snapshot_content_unit_versions,
      :content_unit_version_id,
      name: 'idx_ad_cscuv_cuv_id'

    create_table :ad_lifecycle_environment_paths do |t|
      t.string :name, null: false
      t.text :description
      t.integer :root_environment_id, null: true
      t.string :path, null: true
      t.integer :organization_id, null: false

      t.timestamps
    end

    add_foreign_key :ad_lifecycle_environment_paths, :taxonomies,
      column: :organization_id, name: 'fk_ad_lep_org_id'

    add_index :ad_lifecycle_environment_paths, :name,
      unique: true, name: 'idx_ad_lep_name'
    add_index :ad_lifecycle_environment_paths, :root_environment_id,
      name: 'idx_ad_lep_root_env_id'
    add_index :ad_lifecycle_environment_paths, :path,
      name: 'idx_ad_lep_path'
    add_index :ad_lifecycle_environment_paths, :organization_id,
      name: 'idx_ad_lep_org_id'

    create_table :ad_lifecycle_environments do |t|
      t.string :name, null: false
      t.text :description
      t.integer :lifecycle_environment_path_id, null: false
      t.integer :parent_id, null: true
      t.integer :position, null: false, default: 0
      t.integer :execution_environment_id, null: true
      t.integer :organization_id, null: false
      t.integer :content_snapshot_id, null: true

      t.timestamps
    end

    add_foreign_key :ad_lifecycle_environments, :ad_lifecycle_environment_paths,
      column: :lifecycle_environment_path_id, name: 'fk_ad_le_lep_id'
    add_foreign_key :ad_lifecycle_environments, :ad_lifecycle_environments,
      column: :parent_id, name: 'fk_ad_le_parent_id'
    add_foreign_key :ad_lifecycle_environment_paths, :ad_lifecycle_environments,
      column: :root_environment_id, name: 'fk_ad_lep_root_env_id'
    add_foreign_key :ad_lifecycle_environments, :taxonomies,
      column: :organization_id, name: 'fk_ad_le_org_id'
    add_foreign_key :ad_lifecycle_environments, :ad_execution_environments,
      column: :execution_environment_id, name: 'fk_ad_le_ee_id'
    add_foreign_key :ad_lifecycle_environments, :ad_content_snapshots,
      column: :content_snapshot_id, name: 'fk_ad_le_cs_id'

    add_index :ad_lifecycle_environments, %i[lifecycle_environment_path_id parent_id],
      name: 'idx_ad_le_lep_id_parent_id'
    add_index :ad_lifecycle_environments, %i[lifecycle_environment_path_id position],
      name: 'idx_ad_le_lep_id_position'
    add_index :ad_lifecycle_environments, :execution_environment_id,
      name: 'idx_ad_le_ee_id'
    add_index :ad_lifecycle_environments, :organization_id,
      name: 'idx_ad_le_org_id'
    add_index :ad_lifecycle_environments, :content_snapshot_id,
      name: 'idx_ad_le_cs_id'
    add_index :ad_lifecycle_environments, :parent_id,
      name: 'idx_ad_le_parent_id'

    create_table :ad_lifecycle_environment_content_unit_versions do |t|
      t.integer :lifecycle_environment_id, null: false
      t.integer :content_unit_version_id, null: false
      t.timestamps
    end

    add_foreign_key :ad_lifecycle_environment_content_unit_versions, :ad_lifecycle_environments,
      column: :lifecycle_environment_id, name: 'fk_ad_lecuv_le_id'
    add_foreign_key :ad_lifecycle_environment_content_unit_versions, :ad_content_unit_versions,
      column: :content_unit_version_id, name: 'fk_ad_lecuv_cuv_id'

    add_index :ad_lifecycle_environment_content_unit_versions,
      %i[lifecycle_environment_id content_unit_version_id],
      unique: true,
      name: 'idx_ad_lecuv_unique'
    add_index :ad_lifecycle_environment_content_unit_versions,
      :lifecycle_environment_id,
      name: 'idx_ad_lecuv_le_id'
    add_index :ad_lifecycle_environment_content_unit_versions,
      :content_unit_version_id,
      name: 'idx_ad_lecuv_cuv_id'
  end
end
