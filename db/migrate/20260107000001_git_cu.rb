# frozen_string_literal: true

class GitCu < ActiveRecord::Migration[6.1]
  def change
    add_column :ad_content_units, :source_type, :string
    add_column :ad_content_unit_versions, :dynamic, :boolean, default: false

    create_table :ad_content_unit_revisions do |t|
      t.integer :content_unit_version_id, null: false
      t.string :git_ref, null: false
      t.string :latest_version_href
      t.string :pulp_repository_href
      t.string :pulp_remote_href
      t.string :pulp_distribution_href
      t.timestamps
    end

    add_foreign_key :ad_content_unit_revisions, :ad_content_unit_versions,
      column: :content_unit_version_id, name: 'fk_ad_cur_cuv_id'

    create_table :ad_active_revisions do |t|
      t.integer :content_unit_revision_id, null: false
      t.references :consumable, polymorphic: true, null: false, index: { name: 'idx_adr_cuv' }
    end

    add_foreign_key :ad_active_revisions, :ad_content_unit_revisions,
      column: :content_unit_revision_id, name: 'fk_ad_ar_cur_id'

    add_column :ad_ansible_collection_roles, :content_unit_revision_id, :integer, null: true

    add_foreign_key :ad_ansible_collection_roles, :ad_content_unit_revisions,
      column: :content_unit_revision_id, name: 'fk_ad_acr_cur_id'

    change_column_null :ad_ansible_collection_roles, :ansible_collection_version_id, true
  end
end
