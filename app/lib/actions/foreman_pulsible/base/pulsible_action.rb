# frozen_string_literal: true

module Actions
  module ForemanPulsible
    module Base
      class PulsibleAction < Actions::EntryAction
        def queue
          ::ForemanPulsible::DYNFLOW_QUEUE
        end

        def task_output
          return output if Rails.env.development?
          # TODO: Change default output so something sensible
          humanized_name
        end

        def humanized_name
          "#{::ForemanPulsible::Constants::PLUGIN_NAME.camelize}: #{self.class.name}"
        end
      end
    end
  end
end
