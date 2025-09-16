# frozen_string_literal: true

module ForemanAnsibleDirector
  module Pulp3
    module Ansible
      module Remote
        module Git
          class GitRemoteApi < AnsibleApi
            def initialize(*args)
              super
              @ansible_git_remote_api_client = PulpAnsibleClient::RemotesGitApi.new(@ansible_api_client)
            end
          end
        end
      end
    end
  end
end
