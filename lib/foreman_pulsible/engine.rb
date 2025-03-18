# frozen_string_literal: true

module ForemanPulsible
  DYNFLOW_QUEUE = :foreman_pulsible
  class Engine < ::Rails::Engine
    isolate_namespace ForemanPulsible
    engine_name 'foreman_pulsible'

    # Add any db migrations
    initializer 'foreman_pulsible.load_app_instance_data' do |app|
      ForemanPulsible::Engine.paths['db/migrate'].existent.each do |path|
        app.config.paths['db/migrate'] << path
      end

      app.config.autoload_paths += Dir["#{config.root}/app/lib"]
      app.config.autoload_paths += Dir["#{config.root}/lib"]
      app.config.autoload_paths += Dir["#{config.root}/app/services/foreman_pulsible"]
    end

    initializer 'foreman_pulsible.require_dynflow', before: 'foreman_tasks.initialize_dynflow' do |_app|
      ForemanTasks.dynflow.require!
      # TODO: pool_size Setting
      begin
        ForemanTasks.dynflow.config.queues.add(DYNFLOW_QUEUE, pool_size: 2) if Setting.table_exists?
      rescue StandardError
        (false)
      end
      # ForemanTasks.dynflow.config.eager_load_paths << File.join(ForemanPulsible::Engine.root, 'app/lib/actions')
    end

    initializer 'foreman_pulsible.register_plugin', before: :finisher_hook do |app|
      app.reloader.to_prepare do
        Foreman::Plugin.register :foreman_pulsible do
          requires_foreman '>= 3.12.0'
          register_gettext

          widget 'foreman_pulsible_widget', name: N_('Foreman plugin template widget'), sizex: 4, sizey: 1
        end
      end
    end

    # initializer "foreman_pulsible.register_actions", :before => :finisher_hook do |_app|
    #  ForemanTasks.dynflow.require!
    #
    #  action_paths = %W(#{ForemanPulsible::Engine.root}/app/lib/actions)
    #  ForemanTasks.dynflow.config.eager_load_paths.concat(action_paths)
    #  ForemanTasks.dynflow.eager_load_actions!
    # end

    rake_tasks do
      Rake::Task['db:seed'].enhance do
        ForemanPulsible::Engine.load_seed
      end
    end
  end
end
