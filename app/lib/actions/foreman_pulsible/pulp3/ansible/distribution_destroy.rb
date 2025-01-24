# frozen_string_literal: true
module Actions
  module ForemanPulsible
    module Pulp3
      module Ansible
        class DistributionDestroy < ::Actions::ForemanPulsible::Base::PulsibleAction

          def plan(distribution_href)
            plan_self(distribution_href)
          end

          def run
            output[:distribution_destroy_response] = ::ForemanPulsible::Pulp3::Ansible::Distribution::Destroy.new(input[:distribution_href]).request
          end

          def task_output
            output[:distribution_destroy_response]
          end
        end
      end
    end
  end
end