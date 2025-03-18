# frozen_string_literal: true

module ForemanPulsible
  module Pulp3
    module Ansible
      module Content
        module Collection
          class List < ContentCollectionApi
            def initialize(repository_version_href)
              super
              @repository_version_href = repository_version_href
            end

            def request
              @content_collection_api_client.list(
                { query_params:
                  {
                    offset: 0,
                    repository_version: @repository_version_href,
                    limit: 2000,
                  } }
              )
            end
          end
        end
      end
    end
  end
end
