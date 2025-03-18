# frozen_string_literal: true

module ForemanPulsible
  module Pulp3
    module Ansible
      module Content
        module Collection
          class ContentCollectionApi < AnsibleApi
            def initialize(*args)
              super
              @content_collection_api_client = PulpAnsibleClient::ContentCollectionVersionsApi.new(@ansible_api_client)
            end
          end
        end
      end
    end
  end
end
