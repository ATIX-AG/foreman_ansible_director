# frozen_string_literal: true

module ForemanAnsibleDirector
  module Pulp3
    module Ansible
      module Repository
        class Destroy < RepositoryApi
          def initialize(repository_href)
            super
            @repository_href = repository_href
          end

          def request
            @ansible_repository_api_client.delete(@repository_href)
          end
        end
      end
    end
  end
end
