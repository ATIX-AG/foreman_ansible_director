# frozen_string_literal: true

module ForemanAnsibleDirector
  module Actions
    module Pulp3
      module Ansible
        module Remote
          module Git
            class ListAll < ::ForemanAnsibleDirector::Actions::Base::AnsibleDirectorAction
              input_format do
              end

              output_format do
                param :git_remote_list_response, Array
              end

              def run
                if input[:skip]
                  output.update(git_remote_list_response: [])
                  return
                end

                items = []

                is_finished = false
                offset = 0

                until is_finished
                  response = ::ForemanAnsibleDirector::Pulp3::Ansible::Remote::Git::List.new(
                    offset: offset
                  ).request

                  is_finished = true if response.count <= offset

                  response.results.each do |git_remote|
                    items << {
                      pulp_href: git_remote.pulp_href,
                      name: git_remote.name,
                    }
                  end

                  offset += Setting[:ansible_director_pulp_batch_size]
                end

                output.update(git_remote_list_response: items)
              end

              def task_output
                output[:git_remote_list_response]
              end
            end
          end
        end
      end
    end
  end
end
