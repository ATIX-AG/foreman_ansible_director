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
              param :name_suffix, String, required: false
              param :path_suffix, String, required: false
              param :base_path, String, required: true
              param :repository_href, String, required: true
              param :repository_create_action, Hash, required: true
              param :skip, Boolean, required: false
            end

            output_format do
              param :distribution_create_response, Hash
            end

            def run(*args)
              if input[:skip]
                output.update(distribution_create_response: { pulp_href: '' }, success: true, error: nil)
                return
              elsif !input_valid?
                output.update(distribution_create_response: { pulp_href: '' }, success: false, error: nil)
                return
              end
              super
            end

            def invoke_external_task
              name = input[:name]
              name = "#{name}-#{input[:name_suffix]}" if input[:name_suffix]

              path = input[:base_path]
              path = "#{path}-#{input[:path_suffix]}" if input[:path_suffix]

              repository_href = input[:repository_create_action]['repository_create_response']['pulp_href']

              distribution = PulpAnsibleClient::AnsibleAnsibleDistribution.new(
                {
                  name: name,
                  base_path: path,
                  repository: repository_href,
                }
              )
              begin
                response = ::ForemanAnsibleDirector::Pulp3::Ansible::Distribution::Create.new(distribution).request
                output.update(distribution_create_response: response, success: true, error: nil)
              rescue PulpAnsibleClient::ApiError => e
                output.update(distribution_create_response: nil, success: false, error: e.message)
              end
              nil
            end

            def done?
              output[:task]&.[](:progress) == 1
            end

            def poll_external_task
              if (distribution_create_task_href = output.dig(:distribution_create_response, :task))
                task = ::ForemanAnsibleDirector::Pulp3::Core::Task::Status.new(distribution_create_task_href).request
                task_status = ::ForemanAnsibleDirector::Parsers::Pulp3::Core::Task::Status.new(task)

                if task_status.task_completed?
                  output.update(
                    distribution_create_response: output[:distribution_create_response]
                                                    .merge(pulp_href: task_status.raw_response['created_resources'][0]),
                    error: nil
                  )
                end

                { progress: task_status.progress }
              end

              { progress: 1 }
            end

            def task_output
              output[:distribution_create_response]
            end

            private

            def input_valid?
              repository_href = input[:repository_create_action].dig(:repository_create_response, :pulp_href)
              base_path = input[:base_path]
              name = input[:name]

              repository_href && base_path && name
            end
          end
        end
      end
    end
  end
end
