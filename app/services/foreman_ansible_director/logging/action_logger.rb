# frozen_string_literal: true

module ForemanAnsibleDirector
  module Logging
    class ActionLogger
      class << self
        def logger
          ::Foreman::Logging.logger("#{::ForemanAnsibleDirector::Constants::PLUGIN_NAME}/action")
        end

        def log_trigger(action_class:,
                        task_args:,
                        mode:)
          base_msg = "[TRIGGER (#{mode.to_s.upcase})] #{action_class.name}"

          logger.info(base_msg)

          return if Rails.env.production?

          debug_msg = if task_args.empty?
                        base_msg.to_s
                      else
                        "#{base_msg} | task_args: #{task_args.inspect}"
                      end
          logger.debug(debug_msg)
        end
      end
    end
  end
end
