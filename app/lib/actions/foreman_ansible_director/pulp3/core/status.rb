# frozen_string_literal: true

module Actions
  module ForemanAnsibleDirector
    module Pulp3
      module Core
        class Status < ::Actions::ForemanAnsibleDirector::Base::AnsibleDirectorAction
          def queue
            ::ForemanAnsibleDirector::DYNFLOW_QUEUE
          end

          def plan
            plan_self
          end

          def run
            output[:status_response] = ::ForemanAnsibleDirector::Pulp3::Core::StatusApi.new.request
          end

          def task_output
            output[:status_response]
          end
        end
      end
    end
  end
end
