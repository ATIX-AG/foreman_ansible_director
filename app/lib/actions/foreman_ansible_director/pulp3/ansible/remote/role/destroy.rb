# frozen_string_literal: true

module Actions
  module ForemanAnsibleDirector
    module Pulp3
      module Ansible
        module Remote
          module Role
            class Destroy < ::Actions::ForemanAnsibleDirector::Base::AnsibleDirectorAction
              input_format do
                param :role_remote_href, String, required: true
              end

              output_format do
                param :role_remote_destroy_response, Hash
              end

              def run
                response = ::ForemanAnsibleDirector::Pulp3::Ansible::Remote::Role::Destroy.new(
                  input[:role_remote_href]
                ).request
                output.update(role_remote_destroy_response: response)
              end

              def task_output
                output[:role_remote_destroy_response]
              end
            end
          end
        end
      end
    end
  end
end
