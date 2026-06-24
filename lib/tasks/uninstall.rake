# frozen_string_literal: true

namespace :foreman_ansible_director do
  desc 'Run all Foreman Ansible Director cleanup tasks'
  task uninstall: :environment do
    Rake::Task['foreman_ansible_director:cleanup_pulp_objects'].invoke
    Rake::Task['foreman_ansible_director:revert_db_migrations'].invoke
  end

  desc 'Delete all Pulp objects associated with imported content unit versions'
  task cleanup_pulp_objects: [:environment, 'dynflow:client'] do
    poll_interval = 2

    started_task = ::ForemanTasks.async_task(::ForemanAnsibleDirector::Actions::Pulp3::Util::DestroyAll)

    task = ::ForemanTasks::Task.find_by(id: started_task.id)
    started_at = Time.zone.now

    running_states = %w[planned pending running]
    running = true
    # This isn't pretty, but sync_task uses Setting['foreman_tasks_sync_task_timeout'] which users may choose freely.
    # Overriding this setting is not a good idea either, as that may have side effects.
    while running
      task.reload
      puts "DestroyAll running for #{Time.zone.now - started_at}s"

      if running_states.include?(task.state)
        sleep(poll_interval)
      else
        running = false
        puts <<~RESULT
          DestroyAll task finished with state #{task.state} and result #{task.result}.
          Details are available at: #{Setting[:foreman_url]}/foreman_tasks/tasks/#{started_task.id}
        RESULT
      end
    end
  end

  desc 'Revert all database migrations of the Ansible Director plugin'
  task revert_db_migrations: :environment do
    plugin = Foreman::Plugin.find ForemanAnsibleDirector.name.underscore
    ActiveRecord::MigrationContext.new(plugin.migrations_paths, ActiveRecord::SchemaMigration).down
  end
end
