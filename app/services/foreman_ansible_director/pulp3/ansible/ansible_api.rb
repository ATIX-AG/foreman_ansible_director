# frozen_string_literal: true

module ForemanAnsibleDirector
  module Pulp3
    module Ansible
      class AnsibleApi
        def initialize(*_args)
          @ansible_api_client = Pulp3::BaseClient.ansible_api_client
        end

        def request
          raise NotImplementedError
        end
      end
    end
  end
end
