# frozen_string_literal: true

class AddAnsibleEnvTables < ActiveRecord::Migration[6.1]
  def change
    create_table :pulsible_execution_environments do |t|
      t.string :name, null: false, limit: 255
      t.string :base_image_url, null: false, limit: 255
      t.datetime :last_built
      t.string :image_hash
      t.string :image_url
    end

    create_table :pulsible_execution_environment_content_versions do |t|
      t.references :execution_environment, foreign_key: { to_table: :pulsible_execution_environments },
        index: { name: 'idx_peev_pulsible_execution_environment_id' }
      t.references :ansible_content_version, foreign_key: { to_table: :pulsible_ansible_content_versions },
        index: { name: 'idx_peev_pulsible_ansible_content_version_id' }
    end
  end
end
