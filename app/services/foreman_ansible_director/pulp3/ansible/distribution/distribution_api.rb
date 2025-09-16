# frozen_string_literal: true

module ForemanAnsibleDirector
  module Pulp3
    module Ansible
      module Distribution
        class DistributionApi < AnsibleApi
          def initialize(*args)
            super
            @ansible_distribution_api_client = PulpAnsibleClient::DistributionsAnsibleApi.new(@ansible_api_client)
          end
        end
      end
    end
  end
end
