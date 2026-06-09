# frozen_string_literal: true

module ForemanAnsibleDirector
  class ActionService < AnsibleDirectorService
    class << self
      def trigger(action_class, task_args: {}, mode: :auto)
        effective_sync_mode = case mode
                              when :sync, :async
                                mode
                              when :auto
                                Rails.env.production? ? :async : :sync
                              else
                                raise ArgumentError,
                                  "Invalid sync_mode: #{mode.inspect}. Expected :auto, :sync, or :async"
                              end

        ::ForemanAnsibleDirector::Logging::ActionLogger.log_trigger(
          action_class: action_class,
          task_args: task_args,
          mode: effective_sync_mode
        )

        if effective_sync_mode == :async
          ::ForemanTasks.async_task(action_class, **task_args)
        else # mode == :sync
          ::ForemanTasks.sync_task(action_class, **task_args)
        end
      end
    end
  end
end
