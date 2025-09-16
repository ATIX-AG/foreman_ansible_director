# frozen_string_literal: true

class AddHashToEe < ActiveRecord::Migration[6.1]
  def change
    add_column :ad_execution_environments, :content_hash, :string, null: false, default: ''
  end
end
