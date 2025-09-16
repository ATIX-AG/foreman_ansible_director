# frozen_string_literal: true

module ForemanAnsibleDirector
  module Pulp3
    module Ansible
      module Remote
        module Role
          class Create < RoleRemoteApi
            def initialize(role_remote)
              super
              @role_remote = role_remote
            end

            def request
              @ansible_role_remote_api_client.create(@role_remote)
            end
          end
        end
      end
    end
  end
end
