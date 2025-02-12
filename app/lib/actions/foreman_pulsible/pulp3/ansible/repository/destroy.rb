# frozen_string_literal: true
module Actions
  module ForemanPulsible
    module Pulp3
      module Ansible
        module Repository
          class Destroy < ::Actions::ForemanPulsible::Base::PulsibleAction

            input_format do
              param :repository_href, String, required: true
            end

            output_format do
              param :repository_destroy_response, Hash
            end

            def run
              response = ::ForemanPulsible::Pulp3::Ansible::Repository::Destroy.new(input[:repository_href]).request
              output.update(repository_create_response: response)
            end

            def task_output
              output[:repository_create_response]
            end
          end
        end
      end
    end
  end
end