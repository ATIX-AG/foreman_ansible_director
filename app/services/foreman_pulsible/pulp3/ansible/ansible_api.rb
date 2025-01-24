module ForemanPulsible
  module Pulp3
    module Ansible
      class AnsibleApi
        def initialize(*args)
          @ansible_api_client = Pulp3::BaseClient.ansible_api_client
        end

        def request
          fail NotImplementedError
        end
      end
    end
  end
end