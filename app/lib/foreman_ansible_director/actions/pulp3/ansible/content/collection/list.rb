# frozen_string_literal: true

module ForemanAnsibleDirector
  module Actions
    module Pulp3
      module Ansible
        module Content
          module Collection
            class List < ::ForemanAnsibleDirector::Actions::Base::AnsibleDirectorAction
              input_format do
                param :repository_version_href, String, required: true
                param :skip, Boolean, required: false
              end

              output_format do
                param :repository_artifacts, List
              end

              def run
                if input[:skip]
                  output.update(repository_artifacts: { results: [] })
                  return
                end
                response = ::ForemanAnsibleDirector::Pulp3::Ansible::Content::Collection::List.new(
                  input[:repository_version_href]
                ).request
                output.update(repository_artifacts: response)
              end
            end
          end
        end
      end
    end
  end
end
