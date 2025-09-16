# frozen_string_literal: true

module ForemanAnsibleDirector
  module Pulp3
    module Ansible
      module Repository
        class RepositoryApi < AnsibleApi
          def initialize(*args)
            super
            @ansible_repository_api_client = PulpAnsibleClient::RepositoriesAnsibleApi.new(@ansible_api_client)
          end
        end
      end
    end
  end
end
