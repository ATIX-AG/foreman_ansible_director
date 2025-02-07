module ForemanPulsible
  module Pulp3
    module Ansible
      module Remote
        module Collection
          class CollectionRemoteApi < AnsibleApi
          def initialize(*args)
            super
            @ansible_collection_remote_api_client = PulpAnsibleClient::RemotesCollectionApi.new(@ansible_api_client)
          end
        end
        end
      end
    end
  end
end