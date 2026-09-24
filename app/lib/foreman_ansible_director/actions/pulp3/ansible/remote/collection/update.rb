# frozen_string_literal: true

module ForemanAnsibleDirector
  module Actions
    module Pulp3
      module Ansible
        module Remote
          module Collection
            class Update < ::ForemanAnsibleDirector::Actions::Base::AnsibleDirectorAction
              include Dynflow::Action::Polling

              # Value of a task's :progress once it has fully completed.
              FULL_PROGRESS = 1

              input_format do
                param :collection_remote_href, String, required: true
                param :requirements, String, required: true
              end

              output_format do
                param :collection_remote_update_response, Hash
              end

              def invoke_external_task
                collection_remote = PulpAnsibleClient::PatchedansibleCollectionRemote.new(
                  {
                    requirements_file: input[:requirements],
                  }
                )
                response = ::ForemanAnsibleDirector::Pulp3::Ansible::Remote::Collection::Update.new(
                  input[:collection_remote_href],
                  collection_remote
                ).request
                output.update(collection_remote_update_response: response)
                nil
              end

              def done?
                output[:task]&.[](:progress) == FULL_PROGRESS
              end

              def poll_external_task
                if (remote_update_task = output.dig(:collection_remote_update_response, :task))
                  task = ::ForemanAnsibleDirector::Pulp3::Core::Task::Status.new(remote_update_task).request
                  task_status = ::ForemanAnsibleDirector::Parsers::Pulp3::Core::Task::Status.new(task)

                  { progress: task_status.progress }
                else
                  # Pulp does not spawn a task when the PATCH is a no-op (e.g. the requirements
                  # file is unchanged), so there is nothing to poll for.
                  { progress: FULL_PROGRESS }
                end
              end

              def task_output
                output[:collection_remote_update_response]
              end
            end
          end
        end
      end
    end
  end
end
