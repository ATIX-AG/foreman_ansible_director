# frozen_string_literal: true

module ForemanAnsibleDirector
  module Api
    module V2
      class AnsibleVariablesController < AnsibleDirectorApiController
        before_action :find_resource, only: %i[show update_full update_partial]
        before_action :find_collection_role, only: [:index_acr]

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

        def index_acr
        end

        def variables_for_target
          target = ::ForemanAnsibleDirector::AssignmentService.find_target(
            target_type: params[:target],
            target_id: params[:target_id]
          )

          @variables,
            @resolved_variables,
            @hierarchy = ::ForemanAnsibleDirector::VariableService.variables_for(
              target: target,
              resolve: ::Foreman::Cast.to_bool(params[:resolve])
            )
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
        def update_full
          variable_params = variable_full_params
          validate_yaml! variable_params[:raw_value]
          ::ForemanAnsibleDirector::VariableService.edit_variable(
            variable: @ansible_variable,
            **variable_params
          )
        end

        def update_partial
          arguments = variable_partial_params
          validate_yaml! variable_partial_params[:raw_value]
          ::ForemanAnsibleDirector::VariableService.edit_variable(
            variable: @ansible_variable,
            **arguments
          )
        end

        # region ApiDoc: GET /api/v2/ansible_director/ansible_variables/:target/:target_id/single
        api :GET, '/v2/ansible_director/ansible_variables/:target/:target_id/single', N_('Resolve a single variable')
        # TRANSLATORS: ApiDoc, do not translate!
        description <<~DESC
          Resolve a single variable for a given target, returning all bindings (not just the effective one).
        DESC
        param :target, String, desc: N_('Target type (e.g., Host, Hostgroup)'), required: true
        param :target_id, Integer, desc: N_('Target ID'), required: true
        param :assignable_namespace, String, desc: N_('Namespace of the Ansible content unit'), required: true
        param :assignable_name, String, desc: N_('Name of the Ansible content unit'), required: true
        param :assignable_type, String, desc: N_('Type of the Ansible content unit'), required: true
        param :assignable_role_name, String, desc: N_('Optional role name discriminator'), required: false
        param :variable_name, String, desc: N_('The name of the variable'), required: true
        # endregion
        def resolve_single
          target = ::ForemanAnsibleDirector::AssignmentService.find_target(
            target_type: params[:target],
            target_id: params[:target_id]
          )

          @hierarchical_bindings, @mapped_variable = ::ForemanAnsibleDirector::VariableService.resolve_single(
            **resolve_single_params,
            target: target
          )
        end

        private

        def find_collection_role
          @collection_role = ::ForemanAnsibleDirector::AnsibleCollectionRole.find_by!(id: params[:id])
        end

        def resolve_single_params
          permitted = params.permit(:assignable_namespace,
            :assignable_name,
            :assignable_role_name,
            :assignable_type,
            :variable_name,
            :target,
            :target_id)

          {
            assignable_namespace: permitted.require(:assignable_namespace),
            assignable_name: permitted.require(:assignable_name),
            assignable_role_name: permitted[:assignable_role_name],
            assignable_type: permitted.require(:assignable_type),
            variable_name: permitted.require(:variable_name),
          }
        end

        def variable_partial_params
          params.require(:ansible_variable).permit(:name, :data_type, :raw_value)
        end

        def variable_full_params
          node = params.require(:ansible_variable).permit(:name, :data_type, :raw_value)
          name = node.require(:name)
          data_type = node.require(:data_type)
          raw_value = node.require(:raw_value)
          { name: name, data_type: data_type, raw_value: raw_value }
        end

        def validate_yaml!(string)
          YAML.safe_load(string)
        end

        def resource_class
          ::ForemanAnsibleDirector::AnsibleVariable
        end

        def controller_permission
          'ansible_director_variables'
        end
      end
    end
  end
end
