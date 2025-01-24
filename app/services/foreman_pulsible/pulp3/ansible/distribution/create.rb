module ForemanPulsible
  module Pulp3
    module Ansible
      module Distribution
        class Create < DistributionApi
          def initialize(distribution)
            super
            @distribution = distribution
          end

          def request
            @ansible_distribution_api_client.create(@distribution)
          end
        end
      end
    end
  end
end