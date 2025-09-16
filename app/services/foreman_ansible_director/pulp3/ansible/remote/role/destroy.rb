# frozen_string_literal: true

module ForemanAnsibleDirector
  module Pulp3
    module Ansible
      module Remote
        module Role
          class Destroy < RoleRemoteApi
            def initialize(role_remote_href)
              super
              @role_remote_href = role_remote_href
            end

            def request
              @ansible_role_remote_api_client.delete(@role_remote_href)
            end
          end
        end
      end
    end
  end
end
