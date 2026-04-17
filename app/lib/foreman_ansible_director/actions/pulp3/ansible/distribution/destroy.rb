# frozen_string_literal: true

module ForemanAnsibleDirector
  module Actions
    module Pulp3
      module Ansible
        module Distribution
          class Destroy < ::ForemanAnsibleDirector::Actions::Base::AnsibleDirectorAction
            include Dynflow::Action::Polling

            input_format do
              param :distribution_href, String, required: true
              param :skip, Boolean
            end

            output_format do
              param :distribution_destroy_response, Hash
            end

            def invoke_external_task
              if input[:skip]
                output.update(distribution_destroy_response: nil, success: true)
              else
                begin
                  response =
                    ::ForemanAnsibleDirector::Pulp3::Ansible::Distribution::Destroy.new(input[:distribution_href])
                                                                                   .request
                  output.update(distribution_destroy_response: response, success: true)
                rescue PulpAnsibleClient::ApiError
                  # If the distribution never existed, this job can still be considered successful
                  output.update(distribution_destroy_response: nil, success: true)
                end
              end

              nil
            end

            def done?
              output[:task]&.[](:progress) == 1
            end

            def poll_external_task
              if (distribution_destroy_task = output.dig(:distribution_destroy_response, :task))
                task = ::ForemanAnsibleDirector::Pulp3::Core::Task::Status.new(distribution_destroy_task).request
                task_status = ::ForemanAnsibleDirector::Parsers::Pulp3::Core::Task::Status.new(task)

                { progress: task_status.progress }
              else
                { progress: 1 }
              end
            end

            def task_output
              output[:distribution_destroy_response]
            end
          end
        end
      end
    end
  end
end
