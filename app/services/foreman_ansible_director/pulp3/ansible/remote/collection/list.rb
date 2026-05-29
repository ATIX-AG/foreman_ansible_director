# frozen_string_literal: true

module ForemanAnsibleDirector
  module Pulp3
    module Ansible
      module Remote
        module Collection
          class List < CollectionRemoteApi
            def initialize(offset: 0)
              super
              @offset = offset
            end

            def request
              @ansible_collection_remote_api_client.list(
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
