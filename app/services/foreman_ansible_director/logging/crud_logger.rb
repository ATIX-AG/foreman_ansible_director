# frozen_string_literal: true

module ForemanAnsibleDirector
  module Logging
    class CrudLogger
      class << self
        def logger
          ::Foreman::Logging.logger("#{::ForemanAnsibleDirector::Constants::PLUGIN_NAME}/crud")
        end

        def log_record_creation(record)
          base_msg = "[CREATE] #{record.class.name.demodulize}##{record.id}"

          logger.info(base_msg)

          return if Rails.env.production?

          debug_msg = "#{base_msg} | attributes: #{record.attributes.symbolize_keys.inspect}"
          logger.debug(debug_msg)
        end

        def log_record_update(record)
          base_msg = "[UPDATE] #{record.class.name.demodulize}##{record.id}"

          logger.info(base_msg)

          return if Rails.env.production?

          debug_msg = begin
            changes = record.previous_changes.transform_values { |(old, new)| [old, new] }
            "#{base_msg} | changes: #{changes.to_h.inspect}"
          end
          logger.debug(debug_msg)
        end

        def log_record_deletion(record)
          base_msg = "[DELETE] #{record.class.name.demodulize}##{record.id}"

          logger.info(base_msg)
        end
      end
    end
  end
end
