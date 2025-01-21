module Actions
  module Pulp3
    module Repository
      class Create < Actions::EntryAction
        include Dynflow::Action::WithSubPlans

        def queue
          ForemanPulsible::DYNFLOW_QUEUE
        end

        def plan()
          plan_action(Actions::Pulp3::StatusCheck)
          plan_self
        end

        def run
          logger.debug('SUS!')
        end

        def humanized_name
          "Pulsible test task"
        end

        def create_sub_plans
          trigger(Actions::Pulp3::StatusCheck)
        end

      end
    end
  end
end
