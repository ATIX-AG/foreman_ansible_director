module Actions
  module Pulp3
      class StatusCheck < Actions::EntryAction

        def queue
          ForemanPulsible::DYNFLOW_QUEUE
        end

        def plan()
          plan_self
        end

        def run
          logger.debug('Status check')
        end

        def humanized_name
          "status check task"
        end

      end
  end
end
