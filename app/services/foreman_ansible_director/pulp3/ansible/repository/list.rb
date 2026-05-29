# frozen_string_literal: true

module ForemanAnsibleDirector
  module Pulp3
    module Ansible
      module Repository
        class List < RepositoryApi
          def initialize(offset: 0)
            super
            @offset = offset
          end

          def request
            @ansible_repository_api_client.list(
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
