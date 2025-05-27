# frozen_string_literal: true

class AddAnsibleVersion < ActiveRecord::Migration[6.1]
  def change
    add_column :pulsible_execution_environments, :ansible_version, :string
  end
end
