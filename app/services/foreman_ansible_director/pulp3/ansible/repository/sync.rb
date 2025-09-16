# frozen_string_literal: true

module ForemanAnsibleDirector
  module Pulp3
    module Ansible
      module Repository
        class Sync < RepositoryApi
          def initialize(repository_href, repository_sync_url)
            super
            @repository_href = repository_href
            @repository_sync_url = repository_sync_url
          end

          def request
            @ansible_repository_api_client.sync(@repository_href, @repository_sync_url)
          end
        end
      end
    end
  end
end
