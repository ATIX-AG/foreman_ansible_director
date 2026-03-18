# frozen_string_literal: true

class AnsibleDirectorSchema < ActiveRecord::Migration[6.1]
  def change
    # ====== Ansible content ======
    create_table :ad_content_units do |t|
      t.string :name, null: false
      t.string :namespace, null: false
      t.string :type, null: false
      t.text :description
      t.integer :organization_id, null: false
      t.timestamps
    end

    create_table :ad_content_unit_versions do |t|
      t.string :source, null: false
      t.string :source_type
      t.string :version, null: false
      t.string :latest_version_href
      t.string :pulp_repository_href
      t.string :pulp_remote_href
      t.string :pulp_distribution_href
      t.references :versionable, polymorphic: true, null: false
      t.boolean :dynamic, default: false
      t.timestamps
    end

    create_table :ad_content_unit_revisions do |t|
      t.integer :content_unit_version_id, null: false
      t.string :git_ref, null: false
      t.string :latest_version_href
      t.string :pulp_repository_href
      t.string :pulp_remote_href
      t.string :pulp_distribution_href
      t.timestamps
    end

    create_table :ad_active_revisions do |t|
      t.integer :content_unit_revision_id, null: false
      t.references :consumable, polymorphic: true, null: false
      t.timestamps
    end

    create_table :ad_ansible_collection_roles do |t|
      t.string :name, null: false
      t.integer :ansible_collection_version_id, null: true
      t.text :description
      t.integer :content_unit_revision_id
      t.timestamps
    end

    # ====== Ansible Execution Environments ======
    create_table :ad_execution_environments do |t|
      t.string :name, null: false
      t.string :base_image_url, null: false
      t.string :ansible_version, null: false
      t.string :content_hash, null: false, default: ''
      t.string :build_status, null: true
      t.string :build_job, null: true
      t.integer :organization_id, null: false
      t.timestamps
    end

    create_table :ad_execution_environment_content_units do |t|
      t.integer :execution_environment_id, null: false
      t.integer :content_unit_id, null: false
      t.integer :content_unit_version_id, null: false
      t.timestamps
    end

    # ====== Ansible lifecycle environments ======
    create_table :ad_content_snapshots do |t|
      t.integer :references, null: false
      t.string :content_hash, null: false
      t.timestamps
    end

    create_table :ad_content_snapshot_content_unit_versions do |t|
      t.integer :content_snapshot_id, null: false
      t.integer :content_unit_version_id, null: false
      t.timestamps
    end

    create_table :ad_lifecycle_environment_paths do |t|
      t.string :name, null: false
      t.text :description
      t.integer :root_environment_id, null: true
      t.string :path, null: true
      t.integer :organization_id, null: false
      t.timestamps
    end

    create_table :ad_lifecycle_environments do |t|
      t.string :name, null: false
      t.text :description
      t.integer :lifecycle_environment_path_id, null: false
      t.integer :parent_id, null: true
      t.integer :child_id, null: true
      t.integer :position, null: false, default: 0
      t.integer :execution_environment_id, null: true
      t.integer :organization_id, null: false
      t.integer :content_snapshot_id, null: true
      t.timestamps
    end

    create_table :ad_lifecycle_environment_content_unit_versions do |t|
      t.integer :lifecycle_environment_id, null: false
      t.integer :content_unit_version_id, null: false
      t.timestamps
    end

    create_table :ad_ansible_content_assignments do |t|
      t.references :assignable, polymorphic: true, null: false
      t.references :consumable, polymorphic: true, null: false
      t.boolean :subtractive, default: false
      t.timestamps
    end

    # ====== Foreign keys ======
    # ======= Ansible content =======
    add_foreign_key :ad_content_units, :taxonomies, column: :organization_id

    add_foreign_key :ad_content_unit_revisions,
      :ad_content_unit_versions,
      column: :content_unit_version_id,
      name: 'fk_ad_cur_cuv_id'

    add_foreign_key :ad_active_revisions,
      :ad_content_unit_revisions,
      column: :content_unit_revision_id,
      name: 'fk_ad_ar_cur_id'

    add_foreign_key :ad_ansible_collection_roles,
      :ad_content_unit_versions,
      column: :ansible_collection_version_id,
      name: 'fk_p_acr_on_acv_id'
    add_foreign_key :ad_ansible_collection_roles,
      :ad_content_unit_revisions,
      column: :content_unit_revision_id,
      name: 'fk_ad_acr_cur_id'

    # ======= Ansible Execution Environments =======
    add_foreign_key :ad_execution_environments, :taxonomies, column: :organization_id

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

    # ======= Ansible Lifecycle environments =======
    add_foreign_key :ad_content_snapshot_content_unit_versions,
      :ad_content_snapshots,
      column: :content_snapshot_id,
      name: 'fk_ad_cscuv_cs_id'
    add_foreign_key :ad_content_snapshot_content_unit_versions,
      :ad_content_unit_versions,
      column: :content_unit_version_id,
      name: 'fk_ad_cscuv_cuv_id'

    add_foreign_key :ad_lifecycle_environment_paths, :taxonomies,
      column: :organization_id, name: 'fk_ad_lep_org_id'
    add_foreign_key :ad_lifecycle_environment_paths, :ad_lifecycle_environments,
      column: :root_environment_id, name: 'fk_ad_lep_root_env_id'

    add_foreign_key :ad_lifecycle_environments, :ad_lifecycle_environment_paths,
      column: :lifecycle_environment_path_id, name: 'fk_ad_le_lep_id'
    add_foreign_key :ad_lifecycle_environments, :ad_lifecycle_environments,
      column: :parent_id, name: 'fk_ad_le_parent_id'
    add_foreign_key :ad_lifecycle_environments, :ad_lifecycle_environments,
      column: :child_id, name: 'fk_ad_le_child_id'
    add_foreign_key :ad_lifecycle_environments, :taxonomies,
      column: :organization_id, name: 'fk_ad_le_org_id'
    add_foreign_key :ad_lifecycle_environments, :ad_execution_environments,
      column: :execution_environment_id, name: 'fk_ad_le_ee_id'
    add_foreign_key :ad_lifecycle_environments, :ad_content_snapshots,
      column: :content_snapshot_id, name: 'fk_ad_le_cs_id'

    add_foreign_key :ad_lifecycle_environment_content_unit_versions,
      :ad_lifecycle_environments,
      column: :lifecycle_environment_id, name: 'fk_ad_lecuv_le_id'
    add_foreign_key :ad_lifecycle_environment_content_unit_versions,
      :ad_content_unit_versions,
      column: :content_unit_version_id, name: 'fk_ad_lecuv_cuv_id'

    # ====== Indexes ======
    # ======= Ansible content =======
    add_index :ad_content_units, :organization_id
    add_index :ad_content_units, %i[namespace name]
    add_index :ad_content_units, :type

    add_index :ad_content_unit_versions,
      %i[versionable_type versionable_id version],
      name: 'idx_ad_cuv_on_versionable_and_version'

    add_index :ad_active_revisions, :consumable_type, name: 'idx_ad_ar_consumable_type'

    add_index :ad_ansible_collection_roles,
      %i[ansible_collection_version_id name],
      name: 'idx_p_acr_on_acv_id_and_name'
    add_index :ad_ansible_collection_roles, :content_unit_revision_id,
      name: 'idx_ad_acr_cur_id'

    # ======= Ansible Execution Environments =======
    add_index :ad_execution_environments, :organization_id
    add_index :ad_execution_environments, :name

    add_index :ad_execution_environment_content_units,
      %i[execution_environment_id content_unit_id],
      unique: true,
      name: 'idx_p_eecu_on_ee_id_and_cu_id'

    # ======= Ansible Lifecycle environments =======
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

    add_index :ad_lifecycle_environment_paths, :name,
      name: 'idx_ad_lep_name'
    add_index :ad_lifecycle_environment_paths, :root_environment_id,
      name: 'idx_ad_lep_root_env_id'
    add_index :ad_lifecycle_environment_paths, :path,
      name: 'idx_ad_lep_path'
    add_index :ad_lifecycle_environment_paths, :organization_id,
      name: 'idx_ad_lep_org_id'

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
    add_index :ad_lifecycle_environments, :child_id,
      name: 'idx_ad_le_child_id'

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

    # ======= Assignments =======
    add_index :ad_ansible_content_assignments,
      %i[assignable_type assignable_id consumable_type consumable_id],
      unique: true,
      name: 'idx_ad_aca_unique'

    # ====== Extensions ======
    add_reference :hosts, :ansible_lifecycle_environment, foreign_key: { to_table: :ad_lifecycle_environments }
    add_reference :hostgroups, :ansible_lifecycle_environment, foreign_key: { to_table: :ad_lifecycle_environments }
    add_reference :lookup_keys, :ownable, polymorphic: true, null: true, index: true
  end
end
