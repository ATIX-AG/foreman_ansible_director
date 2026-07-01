# frozen_string_literal: true

class ScopeContentUnitIdentityToOrganization < ActiveRecord::Migration[6.1]
  def up
    remove_index :ad_content_units, %i[namespace name]
    add_index :ad_content_units, %i[name namespace type organization_id], unique: true,
              name: 'idx_ad_content_units_on_name_ns_type_org'
  end

  def down
    remove_index :ad_content_units, name: 'idx_ad_content_units_on_name_ns_type_org'
    add_index :ad_content_units, %i[namespace name]
  end
end
