class AddAnsibleContentTables < ActiveRecord::Migration[6.1]
  def change
    create_table :pulsible_ansible_collections do |t|
      t.string :name, :null => false, :limit => 255, :unique => true
      t.string :namespace, :null => false, :limit => 255, :index => true
      t.string :pulp_repository_href, :null => false, :limit => 255, :unique => true
      t.string :pulp_remote_href, :null => false, :limit => 255, :unique => true
      t.string :pulp_distribution_href, :null => false, :limit => 255, :unique => true
    end

    create_table :pulsible_ansible_roles do |t|
      t.string :name, :null => false, :limit => 255, :unique => true
      t.string :namespace, :null => false, :limit => 255, :unique => true
      t.string :pulp_repository_href, :null => false, :limit => 255, :unique => true
      t.string :pulp_remote_href, :null => false, :limit => 255, :unique => true
      t.string :pulp_distribution_href, :null => false, :limit => 255, :unique => true
    end

    create_table :pulsible_ansible_content_versions do |t|
      t.belongs_to :versionable, :polymorphic => true
      t.string :version, :null => false, :limit => 255, :unique => true
      t.string :sha256, :null => false, :limit => 64, :unique => true
      t.string :artifact_href, :null => false, :limit => 255, :unique => true
    end
  end
end
