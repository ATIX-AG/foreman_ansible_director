# frozen_string_literal: true

class ScopeExecutionEnvironmentNamesToOrganization < ActiveRecord::Migration[6.1]
  def up
    remove_index :ad_execution_environments, :name
    add_index :ad_execution_environments, %i[name organization_id], unique: true,
              name: 'index_ad_execution_environments_on_name_and_org_id'
  end

  def down
    remove_index :ad_execution_environments, name: 'index_ad_execution_environments_on_name_and_org_id'
    add_index :ad_execution_environments, :name
  end
end
