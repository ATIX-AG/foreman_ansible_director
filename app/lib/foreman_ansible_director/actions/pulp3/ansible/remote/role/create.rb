# frozen_string_literal: true

module ForemanAnsibleDirector
  module Actions
    module Pulp3
      module Ansible
        module Remote
          module Role
            class Create < ::ForemanAnsibleDirector::Actions::Base::AnsibleDirectorAction
              input_format do
                param :name, String, required: true
                param :url, String, required: true
              end

              output_format do
                param :role_remote_create_response, Hash
              end

              def run
                role_remote = PulpAnsibleClient::AnsibleRoleRemote.new(
                  {
                    name: input[:name],
                    url: input[:url],
                  }
                )
                response = ::ForemanAnsibleDirector::Pulp3::Ansible::Remote::Role::Create.new(role_remote).request
                output.update(role_remote_create_response: response)
              end

              def task_output
                output[:role_remote_create_response]
              end
            end
          end
        end
      end
    end
  end
end
