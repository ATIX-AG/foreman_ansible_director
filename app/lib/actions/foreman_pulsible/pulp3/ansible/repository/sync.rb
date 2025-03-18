# frozen_string_literal: true

module Actions
  module ForemanPulsible
    module Pulp3
      module Ansible
        module Repository
          class Sync < ::Actions::ForemanPulsible::Base::PulsibleAction
            include Dynflow::Action::Polling

            input_format do
              param :repository_href, String, required: true
              param :remote_href, String, required: true
            end

            output_format do
              param :repository_sync_response, Hash
            end

            def invoke_external_task
              repository_sync = PulpAnsibleClient::AnsibleRepositorySyncURL.new({
                remote: input[:remote_href],
              })
              response = ::ForemanPulsible::Pulp3::Ansible::Repository::Sync.new(
                input[:repository_href], repository_sync
              ).request
              output.update(repository_sync_response: response)
              nil # We return nil here, because the return value of this method becomes output[:task]
            end

            def done?
              output[:task]&.[](:progress) == 1
            end

            def poll_external_task
              sync_task_href = output&.[](:repository_sync_response)&.[](:task) # TODO: Error handling
              task = ::ForemanPulsible::Pulp3::Core::Task::Status.new(sync_task_href).request
              task_status = ::Parsers::Pulp3::Core::Task::Status.new(task)

              { progress: task_status.progress }
            end

            def task_output
              output[:repository_sync_response]
            end
          end
        end
      end
    end
  end
end
