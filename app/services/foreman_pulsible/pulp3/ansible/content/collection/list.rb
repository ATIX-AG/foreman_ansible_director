module ForemanPulsible
  module Pulp3
    module Ansible
      module Content
        module Collection
          class List < ContentCollectionApi

            def initialize(repository_href)
              super
              @repository_href = repository_href
            end

            def request
              @content_collection_api_client.list({ :query_params => { :offset => 0, :repository_version => "#{@repository_href}versions/1/", # Since we only use "latest", the version can be hard-coded
                                                                       :limit => 2000 } })
            end
          end
        end
      end
    end
  end
end