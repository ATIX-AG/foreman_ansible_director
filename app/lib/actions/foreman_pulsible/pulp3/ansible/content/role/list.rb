module Actions
  module ForemanPulsible
    module Pulp3
      module Ansible
        module Content
          module Role
            class List < ::Actions::ForemanPulsible::Base::PulsibleAction

              input_format do
                param :repository_version_href, String, required: true
              end

              output_format do
                param :repository_artifacts, List
              end

              def run
                response = ::ForemanPulsible::Pulp3::Ansible::Content::Role::List.new(input[:repository_version_href]).request
                output.update(repository_artifacts: response)
              end

            end
          end
        end
      end
    end
  end
end