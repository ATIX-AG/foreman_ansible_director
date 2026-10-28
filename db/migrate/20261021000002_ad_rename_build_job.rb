# frozen_string_literal: true

class AdRenameBuildJob < ActiveRecord::Migration[6.1]
  def change
    rename_column :ad_execution_environments, :build_job, :latest_task_id
    rename_column :ad_execution_environments, :build_status, :status
  end
end
