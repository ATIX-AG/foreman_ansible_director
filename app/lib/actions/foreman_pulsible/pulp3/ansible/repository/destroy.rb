# frozen_string_literal: true
module Actions
  module ForemanPulsible
    module Pulp3
      module Ansible
        module Repository
          class Destroy < ::Actions::ForemanPulsible::Base::PulsibleAction

            def plan(repository_href)
              plan_self(repository_href)
            end

            def run
              output[:repository_create_response] = ::ForemanPulsible::Pulp3::Ansible::Repository::Destroy.new(input[:repository_href]).request
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