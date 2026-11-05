# frozen_string_literal: true

class AdRenameBaseImageURL < ActiveRecord::Migration[6.1]
  def change
    rename_column :ad_execution_environments, :base_image_url, :container_image_url
  end
end
