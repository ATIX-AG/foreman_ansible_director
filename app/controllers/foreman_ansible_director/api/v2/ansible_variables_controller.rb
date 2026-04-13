# frozen_string_literal: true

module ForemanAnsibleDirector
  module Api
    module V2
      class AnsibleVariablesController < AnsibleDirectorApiController
        before_action :find_resource, only: %i[show update]

        resource_description { resource_id 'AD Ansible Variables' }

        # region ApiDoc: GET /api/v2/ansible_director/ansible_variables/:id
        api :GET, '/v2/ansible_director/ansible_variables/:id', N_('Show details of an Ansible variable')
        # TRANSLATORS: ApiDoc, do not translate!
        description <<~DESC
          Retrieve details of a specific Ansible variable.
        DESC
        # endregion
        def show
        end

        # region ApiDoc: PUT /api/v2/ansible_director/ansible_variables/:id
        api :PUT, '/v2/ansible_director/ansible_variables/:id', N_('Update an Ansible variable')
        # TRANSLATORS: ApiDoc, do not translate!
        description <<~DESC
          Update basic attributes (key, type, default value, and overridability) of an Ansible variable.
        DESC
        param :ansible_variable, Hash, desc: N_('Ansible variable updates'), required: true do
          param :key,
            String,
            desc: N_('Name of the variable.'),
            example: 'ansible_user',
            required: true
          param :type,
            %w[string integer boolean float json array hash],
            desc: N_('Type of the variable value.'),
            example: 'string',
            required: true
          param :default_value,
            String,
            desc: N_('Default value (must be valid JSON when type is `json`, `array`, or `hash`).'),
            example: 'root',
            required: true
          param :overridable,
            [true, false],
            desc: N_('Whether this variable can be overridden on hosts or hostgroups.'),
            example: true,
            required: false
        end
        # TRANSLATORS: ApiDoc, do not translate!
        example <<~EXAMPLE
          {
            "ansible_variable": {
              "key": "ansible_user",
              "type": "string",
              "default_value": "root",
              "overridable": true
            }
          }
        EXAMPLE
        # endregion
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
