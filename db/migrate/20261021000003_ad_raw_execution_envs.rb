# frozen_string_literal: true

class AdRawExecutionEnvs < ActiveRecord::Migration[6.1]
  def change
    add_column :ad_execution_environments,
      :source,
      :integer,
      null: false,
      after: 'organization_id',
      default: 0

    change_table :ad_execution_environments, bulk: true do |t|
      t.string :container_image_url, null: true
      t.string :ansible_version, null: true
    end
  end
end
