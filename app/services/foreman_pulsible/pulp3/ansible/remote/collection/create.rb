module ForemanPulsible
  module Pulp3
    module Ansible
      module Remote
        module Collection
          class Create < CollectionRemoteApi
            def initialize(collection_remote)
              super
              @collection_remote = collection_remote
            end

            def request
              @ansible_collection_remote_api_client.create(@collection_remote)
            end
          end
        end
      end
    end
  end
end