# frozen_string_literal: true

module ForemanAnsibleDirector
  module Api
    module V2
      class AnsibleVariablesController < AnsibleDirectorApiController
        before_action :find_resource, only: %i[show update]

        def show
        end

        def update
          variable = variable_params
          ::ForemanAnsibleDirector::VariableService.edit_variable(
            variable: @ansible_variable,
            key: variable[:key],
            type: variable[:type],
            default_value: variable[:default_value],
            overridable: variable[:overridable]
          )
        end

        private

        def variable_params
          params.require(:ansible_variable).permit(:key, :type, :default_value, :overridable)
        end

        def resource_class
          ::ForemanAnsibleDirector::AnsibleVariable
        end
      end
    end
  end
end
