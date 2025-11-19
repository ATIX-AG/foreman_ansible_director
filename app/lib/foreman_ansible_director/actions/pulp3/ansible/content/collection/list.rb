# frozen_string_literal: true

module Actions
  module ForemanAnsibleDirector
    module Pulp3
      module Ansible
        module Content
          module Collection
            class List < ::Actions::ForemanAnsibleDirector::Base::AnsibleDirectorAction
              input_format do
                param :repository_version_href, String, required: true
              end

              output_format do
                param :repository_artifacts, List
              end

              def run
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
