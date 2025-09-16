# frozen_string_literal: true

module ForemanAnsibleDirector
  module Pulp3
    module Ansible
      module Remote
        module Collection
          class Update < CollectionRemoteApi
            def initialize(collection_remote_href, collection_remote)
              super
              @collection_remote_href = collection_remote_href
              @collection_remote = collection_remote
            end

            def request
              @ansible_collection_remote_api_client.partial_update(@collection_remote_href, @collection_remote)
            end
          end
        end
      end
    end
  end
end
