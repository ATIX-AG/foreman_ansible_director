# frozen_string_literal: true

module ForemanAnsibleDirector
  module Actions
    module Pulp3
      module Ansible
        module Remote
          module Git
            class Destroy < ::ForemanAnsibleDirector::Actions::Base::AnsibleDirectorAction
              include Dynflow::Action::Polling

              input_format do
                param :git_remote_href, String, required: true
                param :skip, Boolean
              end

              output_format do
                param :git_remote_destroy_response, Hash
              end

              def invoke_external_task
                if input[:skip]
                  output.update(git_remote_destroy_response: nil, success: true)
                else
                  begin
                    response = ::ForemanAnsibleDirector::Pulp3::Ansible::Remote::Git::Destroy.new(
                      input[:git_remote_href]
                    ).request
                    output.update(git_remote_destroy_response: response, success: true, error: nil)
                  rescue PulpAnsibleClient::ApiError
                    output.update(git_remote_destroy_response: nil, success: false, error: nil)
                  end
                end

                nil
              end

              def poll_external_task
                if (git_remote_destroy_task = output.dig(:git_remote_destroy_response, :task))
                  task = ::ForemanAnsibleDirector::Pulp3::Core::Task::Status.new(git_remote_destroy_task).request
                  task_status = ::ForemanAnsibleDirector::Parsers::Pulp3::Core::Task::Status.new(task)

                  { progress: task_status.progress }
                else
                  { progress: 1 }
                end
              end

              def done?
                output[:task]&.[](:progress) == 1
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
