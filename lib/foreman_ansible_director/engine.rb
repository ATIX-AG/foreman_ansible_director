# frozen_string_literal: true

require 'action_cable/engine'
require 'foreman_ansible_director/remote_execution'

module ForemanAnsibleDirector
  DYNFLOW_QUEUE = :foreman_ansible_director
  class Engine < ::Rails::Engine
    isolate_namespace ForemanAnsibleDirector
    engine_name 'foreman_ansible_director'

    # Add any db migrations
    initializer 'foreman_ansible_director.load_app_instance_data' do |app|
      ForemanAnsibleDirector::Engine.paths['db/migrate'].existent.each do |path|
        app.config.paths['db/migrate'] << path
      end

      app.config.autoload_paths += Dir["#{config.root}/app/lib"]
      app.config.autoload_paths += Dir["#{config.root}/lib"]
      app.config.autoload_paths += Dir["#{config.root}/app/services/foreman_ansible_director"]
    end

    initializer 'foreman_ansible_director.require_dynflow', before: 'foreman_tasks.initialize_dynflow' do |_app|
      ForemanTasks.dynflow.require!
      begin
        ForemanTasks.dynflow.config.queues.add(DYNFLOW_QUEUE, pool_size: 2) if Setting.table_exists?
      rescue StandardError
        (false)
      end
    end

    initializer 'foreman_ansible_director.register_plugin', before: :finisher_hook do |app|
      app.reloader.to_prepare do
        require 'foreman_ansible_director/register'
      end
    end

    config.to_prepare do
      ::Organization.include ::ForemanAnsibleDirector::Concerns::OrganizationExtensions
      ::Host.include ::ForemanAnsibleDirector::Concerns::HostExtensions
      ::Host::Base.include ::ForemanAnsibleDirector::Concerns::HostExtensions
      ::Host::Managed.include ::ForemanAnsibleDirector::Concerns::HostExtensions
      ::Hostgroup.include ::ForemanAnsibleDirector::Concerns::HostgroupExtensions
      ::LookupKey.include ::ForemanAnsibleDirector::Concerns::LookupKeysExtensions
      ::ConfigReportImporter.include ForemanAnsibleDirector::AnsibleReportImporter
      ReportImporter.register_smart_proxy_feature('Ansible')
    end

    initializer 'foreman_ansible_director.apipie' do
      Apipie.configuration.checksum_path += ['/foreman_ansible_director/api/']
      Rabl.configure do |config|
        config.view_paths << ForemanAnsibleDirector::Engine.root.join('app', 'views', 'foreman_ansible_director')
      end
    end

    # initializer "foreman_ansible_director.register_actions", :before => :finisher_hook do |_app|
    #  ForemanTasks.dynflow.require!
    #
    #  action_paths = %W(#{ForemanPulsible::Engine.root}/app/lib/actions)
    #  ForemanTasks.dynflow.config.eager_load_paths.concat(action_paths)
    #  ForemanTasks.dynflow.eager_load_actions!
    # end

    rake_tasks do
      Rake::Task['db:seed'].enhance do
        ForemanAnsibleDirector::Engine.load_seed
      end
    end
  end
end
