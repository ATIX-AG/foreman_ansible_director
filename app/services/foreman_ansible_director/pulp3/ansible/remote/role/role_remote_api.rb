# frozen_string_literal: true

module ForemanAnsibleDirector
  module Pulp3
    module Ansible
      module Remote
        module Role
          class RoleRemoteApi < AnsibleApi
            def initialize(*args)
              super
              @ansible_role_remote_api_client = PulpAnsibleClient::RemotesRoleApi.new(@ansible_api_client)
            end
          end
        end
      end
    end
  end
end
