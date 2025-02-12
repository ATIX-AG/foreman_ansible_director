# frozen_string_literal: true
module Actions
  module ForemanPulsible
    module Pulp3
      module Ansible
        module Remote
          module Collection
            class Destroy < ::Actions::ForemanPulsible::Base::PulsibleAction

              input_format do
                param :collection_remote_href, String, required: true
              end

              output_format do
                param :collection_remote_destroy_response, Hash
              end

              def run
                response = ::ForemanPulsible::Pulp3::Ansible::Remote::Collection::Destroy.new(input[:collection_remote_href]).request
                output.update(collection_remote_destroy_response: response)
              end

              def task_output
                output[:collection_remote_destroy_response]
              end
            end
          end
        end
      end
    end
  end
end