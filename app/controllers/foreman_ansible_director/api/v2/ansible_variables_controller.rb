# frozen_string_literal: true

module ForemanAnsibleDirector
  module Api
    module V2
      class AnsibleVariablesController < AnsibleDirectorApiController
        before_action :find_resource, only: %i[show update]

        resource_description do
          resource_id 'ansible_variables'
          api_version 'v2'
          api_base_url '/ansible_director'
          param :organization_id, Integer, show: false
        end

        api :GET, '/ansible_variables/', N_('List ansible variables')
        param_group :search_and_pagination, ::Api::V2::BaseController
        add_scoped_search_description_for(::ForemanAnsibleDirector::AnsibleVariable)

        api :GET, '/ansible_variables/:id', N_('Show ansible variable')
        param :id, :identifier_dottable, required: true

        def show
        end

        api :PUT, '/ansible_variables/:id', N_('Update ansible variable')
        param :id, :identifier_dottable, required: true
        param :ansible_variable, Hash, required: true do
          param :key, String, required: false
          param :type, String, required: false
          param :default_value, String, required: false
          param :overridable, :bool, required: false
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
