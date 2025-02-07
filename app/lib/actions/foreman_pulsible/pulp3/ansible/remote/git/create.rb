# frozen_string_literal: true
module Actions
  module ForemanPulsible
    module Pulp3
      module Ansible
        module Remote
          module Git
            class Create < ::Actions::ForemanPulsible::Base::PulsibleAction

              def plan(git_remote_attributes)
                plan_self(git_remote_attributes)
              end

              def run
                git_remote = PulpAnsibleClient::AnsibleGitRemote.new(input[:git_remote_attributes])
                output[:git_remote_create_response] = ::ForemanPulsible::Pulp3::Ansible::Remote::Git::Create.new(git_remote).request
              end

              def task_output
                output[:git_remote_create_response]
              end
            end
          end
        end
      end
    end
  end
end