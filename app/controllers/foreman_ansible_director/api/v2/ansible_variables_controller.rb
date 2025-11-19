# frozen_string_literal: true

module ForemanAnsibleDirector
  module Api
    module V2
      class AnsibleVariablesController < AnsibleDirectorApiController

        before_action :find_resource, only: [ :show, :update ]

        def show; end

        def update
          variable = variable_params
          variable_update = ::ForemanAnsibleDirector::Structs::AnsibleVariable::AnsibleVariableEdit.new(
            variable[:key],
            variable[:type],
            variable[:default_value],
            variable[:overridable]
          )
          ::ForemanAnsibleDirector::VariableService.edit_variable variable_update, @ansible_variable
        end

        private

        def variable_params
          params.require(:ansible_variable).permit(:key, :type, :default_value, :overridable)
        end

      end
    end
  end
end
