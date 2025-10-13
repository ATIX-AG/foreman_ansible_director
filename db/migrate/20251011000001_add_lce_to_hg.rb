# frozen_string_literal: true

class AddLceToHg < ActiveRecord::Migration[6.1]
  def change
    add_reference :hostgroups, :ansible_lifecycle_environment, foreign_key: { to_table: :ad_lifecycle_environments }
  end
end
