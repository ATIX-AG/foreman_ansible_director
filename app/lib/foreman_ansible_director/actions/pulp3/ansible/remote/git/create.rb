# frozen_string_literal: true

module ForemanAnsibleDirector
  module Actions
    module Pulp3
      module Ansible
        module Remote
          module Git
            class Create < ::ForemanAnsibleDirector::Actions::Base::AnsibleDirectorAction
              input_format do
                param :name, String, required: true
                param :url, String, required: true
                param :git_ref, String, required: true
                param :skip, Boolean, required: false
              end

              output_format do
                param :git_remote_create_response, Hash
              end

              def run
                if input[:skip]
                  output.update(git_remote_create_response: { pulp_href: '' })
                  return
                end
                git_remote = PulpAnsibleClient::AnsibleGitRemote.new({
                  name: input[:name],
                  url: input[:url],
                  git_ref: input[:git_ref],
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
