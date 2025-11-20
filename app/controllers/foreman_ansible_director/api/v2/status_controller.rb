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
      end
    end
  end
end
