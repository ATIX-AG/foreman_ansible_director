# frozen_string_literal: true

module Actions
  module ForemanAnsibleDirector
    module Pulp3
      module Ansible
        module Repository
          class Show < ::Actions::ForemanAnsibleDirector::Base::AnsibleDirectorAction
            input_format do
              param :repository_href, String, required: true
            end

            output_format do
              param :repository_show_response, Hash
            end

            def run
              response = ::ForemanAnsibleDirector::Pulp3::Ansible::Repository::Show.new(input[:repository_href]).request
              output.update(repository_show_response: response)
            end

            def task_output
              output[:repository_show_response]
            end
          end
        end
      end
    end
  end
end
