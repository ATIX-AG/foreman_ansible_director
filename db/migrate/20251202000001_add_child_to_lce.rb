# frozen_string_literal: true

class AddChildToLce < ActiveRecord::Migration[6.1]
  def change
    add_reference :ad_lifecycle_environments, :child, foreign_key: { to_table: :ad_lifecycle_environments }
  end
end
