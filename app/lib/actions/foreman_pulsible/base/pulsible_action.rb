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

        def run; end

        def humanized_name; end

      end
    end
  end
end