# frozen_string_literal: true

module ForemanAnsibleDirector
  module Actions
    module Pulp3
      module Ansible
        module Repository
          class Create < ::ForemanAnsibleDirector::Actions::Base::AnsibleDirectorAction
            input_format do
              param :name, String, required: true
              param :name_suffix, String, required: false
              param :skip, Boolean, required: false
            end

            output_format do
              param :repository_create_response, Hash
            end

            def run
              if input[:skip]
                # Output needs to remain persistent, or we will get an error dereferencing this
                output.update(repository_create_response: { pulp_href: nil })
                return
              end

              name = input[:name]
              name = "#{name}-#{input[:name_suffix]}" if input[:name_suffix]

              repository = PulpAnsibleClient::AnsibleAnsibleRepository.new(
                { name: name }
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
