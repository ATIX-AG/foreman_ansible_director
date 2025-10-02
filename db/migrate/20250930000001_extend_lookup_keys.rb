# frozen_string_literal: true

class ExtendLookupKeys < ActiveRecord::Migration[6.1]
  def change
    add_reference :lookup_keys, :ownable, polymorphic: true, null: true, index: true
  end
end
