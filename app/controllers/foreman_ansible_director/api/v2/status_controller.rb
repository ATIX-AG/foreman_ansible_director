# frozen_string_literal: true

module ForemanAnsibleDirector
  module Api
    module V2
      class StatusController < AnsibleDirectorApiController
        before_action :find_organization, only: %i[content]

        def content
          @global_content = {
            roles: ::ForemanAnsibleDirector::AnsibleRole.where(organization_id: @organization.id).count,
            collections: ::ForemanAnsibleDirector::AnsibleCollection.where(organization_id: @organization.id).count,
            execution_environments: ::ForemanAnsibleDirector::ExecutionEnvironment.where(
              organization_id: @organization.id
            ).count,
          }
        end
      end
    end
  end
end
