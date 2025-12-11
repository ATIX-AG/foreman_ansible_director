# frozen_string_literal: true

module ForemanAnsibleDirector
  module Api
    module V2
      class StatusController < AnsibleDirectorApiController
        before_action :find_organization, only: %i[content]

        def content
          @global_content = {
            roles: ::ForemanAnsibleDirector::AnsibleRole.count,
            collections: ::ForemanAnsibleDirector::AnsibleCollection.count,
            execution_environments: ::ForemanAnsibleDirector::ExecutionEnvironment.count,
          }
        end

        def context
          @context = {
            settings: {
              ad_default_galaxy_url: Setting[:ad_default_galaxy_url],
              ad_default_ansible_core_version: Setting[:ad_default_ansible_core_version],
            },
          }
        end
      end
    end
  end
end
