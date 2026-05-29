# frozen_string_literal: true

module ForemanAnsibleDirector
  module Actions
    module Pulp3
      module Ansible
        module Repository
          class ListAll < ::ForemanAnsibleDirector::Actions::Base::AnsibleDirectorAction
            input_format do
            end

            output_format do
              param :repository_list_response, Array
            end

            def run
              if input[:skip]
                output.update(repository_list_response: [])
                return
              end

              items = []

              is_finished = false
              offset = 0

              until is_finished
                response = ::ForemanAnsibleDirector::Pulp3::Ansible::Repository::List.new(offset: offset).request

                is_finished = true if response.count <= offset

                response.results.each do |repo|
                  items << {
                    pulp_href: repo.pulp_href,
                    name: repo.name,
                  }
                end

                offset += Setting[:ansible_director_pulp_batch_size]
              end

              output.update(repository_list_response: items)
            end

            def task_output
              output[:repository_list_response]
            end
          end
        end
      end
    end
  end
end
