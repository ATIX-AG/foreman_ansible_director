# frozen_string_literal: true

module ForemanAnsibleDirector
  module Api
    module V2
      class AnsibleVariablesController < AnsibleDirectorApiController
        before_action :find_resource, only: %i[show update_full update_partial]
        before_action :find_collection_role, only: [:index_acr]

        before_action :find_optional_organization, only: %i[show index_acr variables_for_target auto_complete_search]

        resource_description { resource_id 'AD Ansible Variables' }

        # region ApiDoc: GET /api/v2/ansible_director/ansible_variables/:id
        api :GET, '/v2/ansible_director/ansible_variables/:id', N_('Show details of an Ansible variable')
        param :id, :number, desc: N_('Variable identifier.'), required: true
        # endregion
        def show
        end

        # region ApiDoc: GET /api/v2/ansible_director/collection_roles/:id/variables
        api :GET, '/v2/ansible_director/collection_roles/:id/variables', N_('List variables for an Ansible collection role')
        param :id, :number, desc: N_('Ansible collection role identifier.'), required: true
        # endregion
        def index_acr
        end

        # region ApiDoc: GET /api/v2/ansible_director/ansible_variables/:target/:target_id
        api :GET, '/v2/ansible_director/ansible_variables/:target/:target_id', N_('List variables for a target')
        # TRANSLATORS: ApiDoc, do not translate!
        description <<~DESC
          Retrieve all Ansible variables for a given target (host or host group).
          If resolve is true, Foreman will resolve the variable values from their bindings.
        DESC
        param :target,
          %w[host hostgroup],
          desc: N_('Type of the target entity.'),
          required: true
        param :target_id,
          :number,
          desc: N_('ID of the target entity.'),
          required: true
        param :resolve,
          :boolean,
          desc: N_('Resolve variable values from bindings.'),
          required: false
        # TRANSLATORS: ApiDoc, do not translate!
        example <<~EXAMPLE
          GET /api/v2/ansible_director/ansible_variables/host/1?resolve=true
        EXAMPLE
        # endregion
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
        description <<~DESC
          Replace an entire variable. All variable attributes have to be provided. To update only a subset of arguments,
          consider using PATCH.
        DESC
        param :id, :number, desc: N_('Variable identifier.'), required: true
        param :ansible_variable, Hash, desc: N_('Variable definition'), required: true do
          param :name,
            String,
            desc: N_('Name of the variable.'),
            example: 'ntp_server',
            required: true
          param :data_type,
            %w[string integer boolean float array dictionary],
            desc: N_('Data type of the variable.'),
            example: 'string',
            required: true
          param :raw_value,
            String,
            desc: N_('Value of the variable (must be valid YAML for any type).'),
            example: "---\\ntime.example.com",
            required: true
        end
        # TRANSLATORS: ApiDoc, do not translate!
        example <<~EXAMPLE
          {
            "ansible_variable": {
              "name": "ntp_server",
              "data_type": "string",
              "raw_value": "---\\ntime.example.com"
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

        # region ApiDoc: PATCH /api/v2/ansible_director/ansible_variables/:id
        api :PATCH, '/v2/ansible_director/ansible_variables/:id', N_('Partially update an Ansible variable')
        description <<~DESC
          Partially update an Ansible variable. To update every variable attribute, consider using PUT, which informs
          you of missing attributes.
        DESC
        param :id, :number, desc: N_('Variable identifier.'), required: true
        param :ansible_variable, Hash, desc: N_('Variable updates'), required: true do
          param :name,
            String,
            desc: N_('Name of the variable.'),
            example: 'ntp_server',
            required: false
          param :data_type,
            %w[string integer boolean float array dictionary],
            desc: N_('Data type of the variable.'),
            example: 'string',
            required: false
          param :raw_value,
            String,
            desc: N_('Value of the variable (must be valid YAML for any type).'),
            example: "---\\nnew-time.example.com",
            required: false
        end
        # TRANSLATORS: ApiDoc, do not translate!
        example <<~EXAMPLE
          {
            "ansible_variable": {
              "raw_value": "---\nnew-time.example.com"
            }
          }
        EXAMPLE
        # endregion
        def update_partial
          arguments = variable_partial_params
          validate_yaml! variable_partial_params[:raw_value]
          ::ForemanAnsibleDirector::VariableService.edit_variable(
            variable: @ansible_variable,
            **arguments
          )
        end

        # region ApiDoc: GET /api/v2/ansible_director/ansible_variables/:target/:target_id/single
        api :GET, '/v2/ansible_director/ansible_variables/:target/:target_id/single', N_('Resolve a single variable for a target')
        # TRANSLATORS: ApiDoc, do not translate!
        description <<~DESC
          View the effective value used when this variable is consumed by Ansible.
        DESC
        param :target,
          %w[host hostgroup],
          desc: N_('Type of the target entity.'),
          required: true
        param :target_id,
          :number,
          desc: N_('ID of the target entity.'),
          required: true
        param :assignable_namespace,
          String,
          desc: N_('Namespace of the assignable.'),
          required: true
        param :assignable_name,
          String,
          desc: N_('Name of the assignable.'),
          required: true
        param :assignable_role_name,
          String,
          desc: N_('Name of the role within the collection (required for AnsibleCollectionRole).'),
          required: false
        param :assignable_type,
          %w[ForemanAnsibleDirector::AnsibleCollectionRole ForemanAnsibleDirector::AnsibleRole],
          desc: N_('Type of the assignable.'),
          required: true
        param :variable_name,
          String,
          desc: N_('Name of the variable to resolve.'),
          required: true
        # TRANSLATORS: ApiDoc, do not translate!
        example <<~EXAMPLE
          GET /api/v2/ansible_director/ansible_variables/host/1/single?assignable_namespace=my_ns&assignable_name=my_collection&assignable_role_name=my_role&assignable_type=ForemanAnsibleDirector::AnsibleCollectionRole&variable_name=ntp_server
        EXAMPLE
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

        def resource_scope
          organization_scoped_resource_scope
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

        def controller_permission
          'ansible_director_variables'
        end
      end
    end
  end
end
