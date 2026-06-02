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
              ansible_director_default_galaxy_url: Setting[:ansible_director_default_galaxy_url],
              ansible_director_default_ansible_core_version: Setting[:ansible_director_default_ansible_core_version],
              ansible_director_ui_refresh_interval: Setting[:ansible_director_ui_refresh_interval],
            },
          }
        end
      end
    end
  end
end
