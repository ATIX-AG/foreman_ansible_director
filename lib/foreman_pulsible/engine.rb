module ForemanPulsible
    DYNFLOW_QUEUE = :foreman_pulsible
  class Engine < ::Rails::Engine
    isolate_namespace ForemanPulsible
    engine_name 'foreman_pulsible'

    # Autoloader config
    config.autoload_paths += Dir["#{config.root}/lib/**/"]
    config.autoload_paths += Dir["#{config.root}/app/services/katello/foreman_pulsible"]

    # Add any db migrations
    initializer 'foreman_pulsible.load_app_instance_data' do |app|
      ForemanPulsible::Engine.paths['db/migrate'].existent.each do |path|
        app.config.paths['db/migrate'] << path
      end
    end

    initializer 'foreman_pulsible.require_dynflow', :before => 'foreman_tasks.initialize_dynflow' do |app|
      ForemanTasks.dynflow.require!
      # TODO: pool_size Setting
      ForemanTasks.dynflow.config.queues.add(DYNFLOW_QUEUE, :pool_size => 2) if Setting.table_exists? rescue(false)
      #ForemanTasks.dynflow.config.eager_load_paths << File.join(ForemanPulsible::Engine.root, 'app/lib/actions')
    end

    initializer 'foreman_pulsible.register_plugin', :before => :finisher_hook do |app|
      app.reloader.to_prepare do
        Foreman::Plugin.register :foreman_pulsible do
          requires_foreman '>= 3.12.0'
          register_gettext

          # Add Global files for extending foreman-core components and routes
          #register_global_js_file 'global'

          # Add permissions
          #security_block :foreman_pulsible do
          #  permission :view_foreman_pulsible, { :'foreman_pulsible/example' => [:new_action],
          #                                              :react => [:index] }
          #end

          # Add a new role called 'Discovery' if it doesn't exist
          #role 'ForemanPluginTemplate', [:view_foreman_pulsible]

          # add menu entry
          #sub_menu :top_menu, :plugin_template, icon: 'pficon pficon-enterprise', caption: N_('Plugin Template'), after: :hosts_menu do
          #  menu :top_menu, :welcome, caption: N_('Welcome Page'), engine: ForemanPulsible::Engine
          #  menu :top_menu, :new_action, caption: N_('New Action'), engine: ForemanPulsible::Engine
          #end

          # add dashboard widget
          widget 'foreman_pulsible_widget', name: N_('Foreman plugin template widget'), sizex: 4, sizey: 1
        end
      end
    end

    #initializer "foreman_pulsible.register_actions", :before => :finisher_hook do |_app|
    #  ForemanTasks.dynflow.require!
#
    #  action_paths = %W(#{ForemanPulsible::Engine.root}/app/lib/actions)
    #  ForemanTasks.dynflow.config.eager_load_paths.concat(action_paths)
    #  ForemanTasks.dynflow.eager_load_actions!
    #end

    # Include concerns in this config.to_prepare block
    config.to_prepare do
      Host::Managed.include ForemanPulsible::HostExtensions
      HostsHelper.include ForemanPulsible::HostsHelperExtensions
    rescue StandardError => e
      Rails.logger.warn "ForemanPluginTemplate: skipping engine hook (#{e})"
    end

    rake_tasks do
      Rake::Task['db:seed'].enhance do
        ForemanPulsible::Engine.load_seed
      end
    end
  end
end
