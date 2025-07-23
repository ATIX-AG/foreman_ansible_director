# frozen_string_literal: true

module Api
  module V2
    class StatusController < PulsibleApiController
      before_action :find_organization, only: %i[content]

      def content
        @global_content = {
          roles: AnsibleRole.count,
          collections: AnsibleCollection.count,
          execution_environments: ExecutionEnvironment.count,
        }
      end
    end
  end
end
