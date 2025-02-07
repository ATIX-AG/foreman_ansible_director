# frozen_string_literal: true
module Actions
  module ForemanPulsible
    module Pulp3
      module Ansible
        module Remote
          module Collection
            class Destroy < ::Actions::ForemanPulsible::Base::PulsibleAction

              def plan(collection_remote_href)
                plan_self(collection_remote_href)
              end

              def run
                output[:collection_remote_create_response] = ::ForemanPulsible::Pulp3::Ansible::Remote::Collection::Destroy.new(input[:collection_remote_href]).request
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