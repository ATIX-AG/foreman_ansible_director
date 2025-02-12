# frozen_string_literal: true
module Actions
  module ForemanPulsible
    module Pulp3
      module Ansible
        module Repository
          class Sync < ::Actions::ForemanPulsible::Base::PulsibleAction

            input_format do
              param :repository_href, String, required: true
              param :remote_href, String, required: true
            end

            output_format do
              param :repository_sync_response, Hash
            end

            def run
              repository_sync = PulpAnsibleClient::AnsibleRepositorySyncURL.new({
                                                                                  :remote => input[:remote_href],
                                                                                })
              response = ::ForemanPulsible::Pulp3::Ansible::Repository::Sync.new(input[:repository_href], repository_sync).request
              output.update(repository_sync_response: response)
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