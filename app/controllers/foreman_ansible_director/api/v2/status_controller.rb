# frozen_string_literal: true

module ForemanAnsibleDirector
  module Api
    module V2
      class StatusController < AnsibleDirectorApiController
        before_action :find_organization, only: %i[content]

        resource_description do
          resource_id 'status'
          api_version 'v2'
          api_base_url '/ansible_director'
          param :organization_id, Integer, show: false
        end

        api :GET, '/status/content', N_('Show global ansible content counts')
        param :organization_id, Integer, required: true

        def content
          @global_content = {
            roles: ::ForemanAnsibleDirector::AnsibleRole.count,
            collections: ::ForemanAnsibleDirector::AnsibleCollection.count,
            execution_environments: ::ForemanAnsibleDirector::ExecutionEnvironment.count,
          }
        end

        api :GET, '/status/context', N_('Show ansible director settings context')

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
