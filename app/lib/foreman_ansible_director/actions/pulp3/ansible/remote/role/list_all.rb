# frozen_string_literal: true

module ForemanAnsibleDirector
  module Actions
    module Pulp3
      module Ansible
        module Remote
          module Role
            class ListAll < ::ForemanAnsibleDirector::Actions::Base::AnsibleDirectorAction
              input_format do
              end

              output_format do
                param :role_remote_list_response, Array
              end

              def run
                if input[:skip]
                  output.update(role_remote_list_response: [])
                  return
                end

                items = []

                is_finished = false
                offset = 0

                until is_finished
                  response = ::ForemanAnsibleDirector::Pulp3::Ansible::Remote::Role::List.new(
                    offset: offset
                  ).request

                  is_finished = true if response.count <= offset

                  response.results.each do |role_remote|
                    items << {
                      pulp_href: role_remote.pulp_href,
                      name: role_remote.name,
                    }
                  end

                  offset += Setting[:ansible_director_pulp_batch_size]
                end

                output.update(role_remote_list_response: items)
              end

              def task_output
                output[:role_remote_list_response]
              end
            end
          end
        end
      end
    end
  end
end
