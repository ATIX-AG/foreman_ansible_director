# frozen_string_literal: true

class EeStatus < ActiveRecord::Migration[6.1]
  def change
    add_column :ad_execution_environments, :build_status, :string, null: true
    add_column :ad_execution_environments, :build_job, :string, null: true

  end
end
