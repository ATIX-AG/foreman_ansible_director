# frozen_string_literal: true

module ForemanAnsibleDirector
  module Pulp3
    module Ansible
      module Distribution
        class Destroy < DistributionApi
          def initialize(distribution_href)
            super
            @distribution = distribution_href
          end

          def request
            @ansible_distribution_api_client.delete(@distribution)
          end
        end
      end
    end
  end
end
