# frozen_string_literal: true

module ForemanAnsibleDirector
  module Pulp3
    module Ansible
      module Content
        module Role
          class ContentRoleApi < AnsibleApi
            def initialize(*args)
              super
              @content_role_api_client = PulpAnsibleClient::ContentRolesApi.new(@ansible_api_client)
            end
          end
        end
      end
    end
  end
end
