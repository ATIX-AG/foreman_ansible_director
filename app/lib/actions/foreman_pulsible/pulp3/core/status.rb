# frozen_string_literal: true

module Actions
  module ForemanPulsible
    module Pulp3
      module Core
        class Status < ::Actions::ForemanPulsible::Base::PulsibleAction
          def queue
            ::ForemanPulsible::DYNFLOW_QUEUE
          end

          def plan
            plan_self
          end

          def run
            output[:status_response] = ::ForemanPulsible::Pulp3::Core::StatusApi.new.request
          end

          def task_output
            output[:status_response]
          end
        end
      end
    end
  end
end
