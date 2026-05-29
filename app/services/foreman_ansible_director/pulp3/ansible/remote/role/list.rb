# frozen_string_literal: true

module ForemanAnsibleDirector
  module Pulp3
    module Ansible
      module Remote
        module Role
          class List < RoleRemoteApi
            def initialize(offset: 0)
              super
              @offset = offset
            end

            def request
              @ansible_role_remote_api_client.list(
                pulp_label_select: "creator=#{::ForemanAnsibleDirector::Constants::PLUGIN_NAME}",
                ordering: ['name'],
                limit: Setting[:ansible_director_pulp_batch_size],
                offset: @offset
              )
            end
          end
        end
      end
    end
  end
end
