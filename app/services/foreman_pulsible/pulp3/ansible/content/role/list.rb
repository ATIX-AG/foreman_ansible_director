module ForemanPulsible
  module Pulp3
    module Ansible
      module Content
        module Role
          class List < ContentRoleApi

            def initialize(repository_version_href)
              super
              @repository_version_href = repository_version_href
            end

            def request
              @content_role_api_client.list({ :query_params => { :offset => 0, :repository_version => @repository_version_href, # Since we only use "latest", the version can be hard-coded
                                                                       :limit => 2000 } })
            end
          end
        end
      end
    end
  end
end