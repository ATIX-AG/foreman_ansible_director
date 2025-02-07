# frozen_string_literal: true
module Actions
  module ForemanPulsible
    module Pulp3
      module Ansible
        module Remote
          module Collection
            class Create < ::Actions::ForemanPulsible::Base::PulsibleAction

              def plan(collection_remote_attributes)
                plan_self(collection_remote_attributes)
              end

              def run
                collection_remote = PulpAnsibleClient::AnsibleCollectionRemote.new(input[:collection_remote_attributes])
                output[:collection_remote_create_response] = ::ForemanPulsible::Pulp3::Ansible::Remote::Collection::Create.new(collection_remote).request
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