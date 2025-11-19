# frozen_string_literal: true

module Actions
  module ForemanAnsibleDirector
    module Pulp3
      module Ansible
        module Repository
          class Destroy < ::Actions::ForemanAnsibleDirector::Base::AnsibleDirectorAction
            include Dynflow::Action::Polling

            input_format do
              param :repository_href, String, required: true
            end

            output_format do
              param :repository_destroy_response, Hash
            end

            def invoke_external_task
              response =
                ::ForemanAnsibleDirector::Pulp3::Ansible::Repository::Destroy.new(input[:repository_href]).request
              output.update(repository_destroy_response: response)
              nil
            end

            def done?
              output[:task]&.[](:progress) == 1
            end

            def poll_external_task
              repository_destroy_task = output&.[](:repository_destroy_response)&.[](:task)
              task = ::ForemanAnsibleDirector::Pulp3::Core::Task::Status.new(repository_destroy_task).request
              task_status = ::ForemanAnsibleDirector::Parsers::Pulp3::Core::Task::Status.new(task)

              { progress: task_status.progress }
            end

            def task_output
              output[:repository_destroy_response]
            end
          end
        end
      end
    end
  end
end
