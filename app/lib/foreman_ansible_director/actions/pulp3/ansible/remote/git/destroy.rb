# frozen_string_literal: true

module ForemanAnsibleDirector
  module Actions
    module Pulp3
      module Ansible
        module Remote
          module Git
            class Destroy < ::ForemanAnsibleDirector::Actions::Base::AnsibleDirectorAction
              input_format do
                param :git_remote_href, String, required: true
              end

              output_format do
                param :git_remote_destroy_response, Hash
              end

              def run
                response =
                  ::ForemanAnsibleDirector::Pulp3::Ansible::Remote::Git::Destroy
                  .new(input[:git_remote_href]).request
                output.update(git_remote_destroy_response: response)
              end

              def task_output
                output[:git_remote_destroy_response]
              end
            end
          end
        end
      end
    end
  end
end
