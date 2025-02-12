# frozen_string_literal: true
module Actions
  module ForemanPulsible
    module Pulp3
      module Ansible
        module Distribution
          class Destroy < ::Actions::ForemanPulsible::Base::PulsibleAction

            input_format do
              param :distribution_href, String, required: true
            end

            output_format do
              param :distribution_destroy_response, Hash
            end

            def run
              response = ::ForemanPulsible::Pulp3::Ansible::Distribution::Destroy.new(input[:distribution_href]).request
              output.update(distribution_destroy_response: response)
            end

            def task_output
              output[:distribution_destroy_response]
            end
          end
        end
      end
    end
  end
end