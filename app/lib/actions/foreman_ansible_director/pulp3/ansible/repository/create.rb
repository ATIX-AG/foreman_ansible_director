# frozen_string_literal: true

module Actions
  module ForemanAnsibleDirector
    module Pulp3
      module Ansible
        module Repository
          class Create < ::Actions::ForemanAnsibleDirector::Base::AnsibleDirectorAction
            input_format do
              param :name, String, required: true
            end

            output_format do
              param :repository_create_response, Hash
            end

            def run
              repository = PulpAnsibleClient::AnsibleAnsibleRepository.new(
                { name: input[:name] }
              )
              response = ::ForemanAnsibleDirector::Pulp3::Ansible::Repository::Create.new(repository).request
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
