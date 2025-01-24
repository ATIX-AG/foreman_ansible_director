module ForemanPulsible
  module Pulp3
    module Ansible
      module Repository
        class Create < RepositoryApi
          def initialize(repository)
            super
            @repository = repository
          end

          def request
            @ansible_repository_api_client.create(@repository)
          end
        end
      end
    end
  end
end