# frozen_string_literal: true

module ForemanAnsibleDirector
  module Actions
    module Pulp3
      module Ansible
        module Distribution
          class ListAll < ::ForemanAnsibleDirector::Actions::Base::AnsibleDirectorAction
            input_format do
            end

            output_format do
              param :distribution_list_response, Array
            end

            def run
              if input[:skip]
                output.update(distribution_list_response: [])
                return
              end

              items = []

              is_finished = false
              offset = 0

              until is_finished
                response = ::ForemanAnsibleDirector::Pulp3::Ansible::Distribution::List.new(offset: offset).request

                is_finished = true if response.count <= offset

                response.results.each do |distribution|
                  items << {
                    pulp_href: distribution.pulp_href,
                    name: distribution.name,
                  }
                end

                offset += Setting[:ansible_director_pulp_batch_size]
              end

              output.update(distribution_list_response: items)
            end

            def task_output
              output[:distribution_list_response]
            end
          end
        end
      end
    end
  end
end
