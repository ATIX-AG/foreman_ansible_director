# frozen_string_literal: true

module ForemanAnsibleDirector
  module Actions
    module Pulp3
      module Ansible
        module Distribution
          class Create < ::ForemanAnsibleDirector::Actions::Base::AnsibleDirectorAction
            include Dynflow::Action::Polling

            input_format do
              param :name, String, required: true
              param :base_path, String, required: true
              param :repository_href, String, required: true
            end

            output_format do
              param :distribution_create_response, Hash
            end

            def invoke_external_task
              distribution = PulpAnsibleClient::AnsibleAnsibleDistribution.new(
                {
                  name: input[:name],
                  base_path: input[:base_path],
                  repository: input[:repository_href],
                }
              )
              response = ::ForemanAnsibleDirector::Pulp3::Ansible::Distribution::Create.new(distribution).request
              output.update(distribution_create_response: response)
              nil
            end

            def done?
              output[:task]&.[](:progress) == 1
            end

            def poll_external_task
              distribution_create_task_href = output&.[](:distribution_create_response)&.[](:task) # TODO: Handle Error
              task = ::ForemanAnsibleDirector::Pulp3::Core::Task::Status.new(distribution_create_task_href).request
              task_status = ::ForemanAnsibleDirector::Parsers::Pulp3::Core::Task::Status.new(task)

              if task_status.task_completed?
                output.update(
                  distribution_create_response: output[:distribution_create_response]
                                                  .merge(pulp_href: task_status.raw_response['created_resources'][0])
                )
              end

              { progress: task_status.progress }
            end

            def task_output
              output[:distribution_create_response]
            end
          end
        end
      end
    end
  end
end
