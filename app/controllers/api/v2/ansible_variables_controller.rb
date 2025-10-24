# frozen_string_literal: true

module Api
  module V2
    class AnsibleVariablesController < AnsibleDirectorApiController

      before_action :find_resource, only: [ :show ]

      def show; end

    end
  end
end
