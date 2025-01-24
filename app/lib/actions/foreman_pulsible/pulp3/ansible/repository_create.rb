# frozen_string_literal: true
module Actions
  module ForemanPulsible
    module Pulp3
      module Ansible
        class RepositoryCreate < ::Actions::ForemanPulsible::Base::PulsibleAction

          def plan(repository_attributes)
            plan_self(repository_attributes)
          end

          def run
            repository = PulpAnsibleClient::AnsibleAnsibleRepository.new(input[:repository_attributes])
            output[:repository_create_response] = ::ForemanPulsible::Pulp3::Ansible::Repository::Create.new(repository).request
          end

          def task_output
            output[:repository_create_response]
          end
        end
      end
    end
  end
end