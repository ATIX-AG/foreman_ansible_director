# frozen_string_literal: true
module Actions
  module ForemanPulsible
    module Pulp3
      module Ansible
        class DistributionCreate < ::Actions::ForemanPulsible::Base::PulsibleAction

          def plan(distribution_attributes)
            plan_self(distribution_attributes)
          end

          def run
            distribution = PulpAnsibleClient::AnsibleAnsibleDistribution.new(input[:distribution_attributes])
            output[:distribution_create_response] = ::ForemanPulsible::Pulp3::Ansible::Distribution::Create.new(distribution).request
          end

          def task_output
            output[:distribution_create_response]
          end
        end
      end
    end
  end
end