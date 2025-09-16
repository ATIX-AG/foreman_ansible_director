# frozen_string_literal: true
module Actions
  module ForemanAnsibleDirector
    module Pulp3
      module Ansible
        module Remote
          module Git
            class Create < ::Actions::ForemanAnsibleDirector::Base::AnsibleDirectorAction

              input_format do
                param :name, String, required: true
                param :url, String, required: true
                param :git_ref, String, required: true
              end

              output_format do
                param :git_remote_create_response, Hash
              end

              def run
                git_remote = PulpAnsibleClient::AnsibleGitRemote.new({
                  :name => input[:name],
                  :url => input[:url],
                  :git_ref => input[:git_ref],
                                                                     })
                response = ::ForemanAnsibleDirector::Pulp3::Ansible::Remote::Git::Create.new(git_remote).request
                output.update(git_remote_create_response: response)
              end

              def task_output
                output[:git_remote_create_response]
              end
            end
          end
        end
      end
    end
  end
end