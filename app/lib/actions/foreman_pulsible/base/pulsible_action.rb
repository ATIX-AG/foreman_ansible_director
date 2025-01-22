module Actions
  module ForemanPulsible
    module Base
      class PulsibleAction < Actions::EntryAction
        def queue
          ::ForemanPulsible::DYNFLOW_QUEUE
        end

        def plan()
          plan_self
        end

        def run
          fail NotImplementedError
        end

        def task_output
          if Rails.env.development?
            return output
          end
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