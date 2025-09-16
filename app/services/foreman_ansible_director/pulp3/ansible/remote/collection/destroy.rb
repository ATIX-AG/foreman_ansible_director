# frozen_string_literal: true

module ForemanAnsibleDirector
  module Pulp3
    module Ansible
      module Remote
        module Collection
          class Destroy < CollectionRemoteApi
            def initialize(collection_remote_href)
              super
              @collection_remote_href = collection_remote_href
            end

            def request
              @ansible_collection_remote_api_client.delete(@collection_remote_href)
            end
          end
        end
      end
    end
  end
end
