# frozen_string_literal: true
module Actions
  module ForemanPulsible
    module Pulp3
      module Ansible
        module Repository
          class Sync < ::Actions::ForemanPulsible::Base::PulsibleAction

            def plan(snyc_attributes)
              plan_self(snyc_attributes)
            end

            def run
              repository_sync = PulpAnsibleClient::AnsibleRepositorySyncURL.new(input[:sync_attributes][:repository_sync_attributes])
              output[:repository_sync_response] = ::ForemanPulsible::Pulp3::Ansible::Repository::Sync.new(input[:sync_attributes][:repository_href], repository_sync).request
            end

            def task_output
              output[:repository_sync_response]
            end
          end
        end
      end
    end
  end
end