# frozen_string_literal: true

module ForemanAnsibleDirector
  module Actions
    module Pulp3
      module Ansible
        module Remote
          module Collection
            class Destroy < ::ForemanAnsibleDirector::Actions::Base::AnsibleDirectorAction
              include Dynflow::Action::Polling

              input_format do
                param :collection_remote_href, String, required: true
                param :skip, Boolean
              end

              output_format do
                param :collection_remote_destroy_response, Hash
              end

              def invoke_external_task
                if input[:skip]
                  output.update(collection_remote_destroy_response: nil, success: true)
                else
                  begin
                    response = ::ForemanAnsibleDirector::Pulp3::Ansible::Remote::Collection::Destroy.new(
                      input[:collection_remote_href]
                    ).request
                    output.update(collection_remote_destroy_response: response, success: true)
                  rescue PulpAnsibleClient::ApiError
                    # If the remote never existed, this job can still be considered successful
                    output.update(collection_remote_destroy_response: nil, success: true)
                  end
                end

                nil
              end

              def done?
                output[:task]&.[](:progress) == 1
              end

              def poll_external_task
                if (collection_remote_destroy_task = output.dig(:collection_remote_destroy_response, :task))
                  task = ::ForemanAnsibleDirector::Pulp3::Core::Task::Status.new(collection_remote_destroy_task).request
                  task_status = ::ForemanAnsibleDirector::Parsers::Pulp3::Core::Task::Status.new(task)

                  { progress: task_status.progress }
                else
                  { progress: 1 }
                end
              end

              def task_output
                output[:collection_remote_destroy_response]
              end
            end
          end
        end
      end
    end
  end
end
