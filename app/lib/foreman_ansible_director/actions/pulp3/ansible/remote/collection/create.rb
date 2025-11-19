# frozen_string_literal: true

module Actions
  module ForemanAnsibleDirector
    module Pulp3
      module Ansible
        module Remote
          module Collection
            class Create < ::Actions::ForemanAnsibleDirector::Base::AnsibleDirectorAction
              input_format do
                param :name, String, required: true
                param :url, String, required: true
                param :requirements, String, required: true
              end

              output_format do
                param :collection_remote_create_response, Hash
              end

              def run
                collection_remote = PulpAnsibleClient::AnsibleCollectionRemote.new(
                  {
                    name: input[:name],
                    url: input[:url],
                    requirements_file: input[:requirements],
                  }
                )
                response =
                  ::ForemanAnsibleDirector::Pulp3::Ansible::Remote::Collection::Create.new(collection_remote).request
                output.update(collection_remote_create_response: response)
              end

              def task_output
                output[:collection_remote_create_response]
              end
            end
          end
        end
      end
    end
  end
end
