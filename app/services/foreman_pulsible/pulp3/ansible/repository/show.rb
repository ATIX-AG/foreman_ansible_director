# frozen_string_literal: true

module ForemanPulsible
  module Pulp3
    module Ansible
      module Repository
        class Show < RepositoryApi
          def initialize(repository_href)
            super
            @repository_href = repository_href
          end

          def request
            @ansible_repository_api_client.read(@repository_href)
          end
        end
      end
    end
  end
end
