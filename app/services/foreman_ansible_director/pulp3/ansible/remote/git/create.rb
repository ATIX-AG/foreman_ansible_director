# frozen_string_literal: true

module ForemanAnsibleDirector
  module Pulp3
    module Ansible
      module Remote
        module Git
          class Create < GitRemoteApi
            def initialize(git_remote)
              super
              @git_remote = git_remote
            end

            def request
              @ansible_git_remote_api_client.create(@git_remote)
            end
          end
        end
      end
    end
  end
end
