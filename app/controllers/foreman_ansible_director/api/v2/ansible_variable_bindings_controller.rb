# frozen_string_literal: true

module ForemanAnsibleDirector
  module Api
    module V2
      class AnsibleVariableBindingsController < AnsibleDirectorApiController
        before_action :find_resource, only: %w[show destroy update_full update_partial]
        before_action :find_variable, only: [:index_for_variable]

        before_action :find_organization, only: %i[create]
        before_action :find_optional_organization, only: %i[index_for_variable auto_complete_search]

        resource_description { resource_id 'AD Ansible Variable Bindings' }

        def index_for_variable
        end

        # region ApiDoc: GET /api/v2/ansible_director/ansible_variables/bindings/:id
        api :GET, '/v2/ansible_director/variables/bindings/:id', N_('Show details of a variable binding')
        param :id, :number, desc: N_('Variable binding identifier'), required: true
        # endregion
        def show
        end

        # region ApiDoc: POST /api/v2/ansible_director/ansible_variables/bindings
        api :POST, '/api/v2/ansible_director/variables/bindings', N_('Create a variable binding')
        param :organization_id, :number, desc: N_('Organization identifier'), required: true
        param :ansible_variable_binding, Hash, desc: N_('Variable binding definition'), required: true do
          param :variable_name,
            String,
            desc: N_('Name of the Ansible variable to bind.'),
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
            example: "---\ntime.example.com",
            required: true
          param :assignable_type,
            %w[ForemanAnsibleDirector::AnsibleCollectionRole ForemanAnsibleDirector::AnsibleRole],
            desc: N_('Type of the assignable (ForemanAnsibleDirector::AnsibleCollectionRole | ForemanAnsibleDirector::AnsibleRole).'),
            required: true
          param :assignable_namespace,
            String,
            desc: N_('Namespace of the assignable.'),
            example: 'my_namespace',
            required: true
          param :assignable_name,
            String,
            desc: N_('Name of the assignable.'),
            example: 'my_collection',
            required: true
          param :assignable_role_name,
            String,
            desc: N_('Name of the role within the collection (required for AnsibleCollectionRole).'),
            example: 'my_role',
            required: false
          param :target,
            String,
            desc: N_('Target type for the binding (host | hostgroup).'),
            example: 'host',
            required: true
          param :target_id,
            :number,
            desc: N_('ID of the target entity.'),
            example: 1,
            required: true
        end
        # TRANSLATORS: ApiDoc, do not translate!
        example <<~EXAMPLE
          {
            "organization_id": 1,
            "ansible_variable_binding": {
              "variable_name": "ntp_server",
              "data_type": "string",
              "raw_value": "---\\ntime.example.com",
              "assignable_type": "ForemanAnsibleDirector::AnsibleCollectionRole",
              "assignable_namespace": "my_namespace",
              "assignable_name": "my_collection",
              "assignable_role_name": "my_role",
              "target": "host",
              "target_id": 1
            }
          }
        EXAMPLE
        # endregion
        def create
          binding_params = variable_binding_create_params
          validate_yaml! variable_binding_create_params[:raw_value]

          target = ::ForemanAnsibleDirector::AssignmentService.find_target(
            target_type: binding_params[:target],
            target_id: binding_params[:target_id]
          )

          @created_binding = ::ForemanAnsibleDirector::VariableBindingService.create_variable_binding(
            variable_name: binding_params[:variable_name],
            data_type: binding_params[:data_type],
            raw_value: binding_params[:raw_value],
            target: target,
            assignable_type: binding_params[:assignable_type],
            assignable_namespace: binding_params[:assignable_namespace],
            assignable_name: binding_params[:assignable_name],
            assignable_role_name: binding_params[:assignable_role_name],
            organization_id: @organization.id
          )
        end

        # region ApiDoc: PUT /api/v2/ansible_director/ansible_variables/bindings/:id
        api :PUT, '/v2/ansible_director/ansible_variables/bindings/:id', N_('Update a variable binding')
        description <<~DESC
          Replace an entire variable binding. All binding attributes have to be provided. To update only a subset of+
          arguments, consider using PATCH.
        DESC
        param :ansible_variable_binding, Hash, desc: N_('Variable binding updates'), required: true do
          param :variable_name,
                String,
                desc: N_('Name of the Ansible variable to bind.'),
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
          param :assignable_type,
                %w[ForemanAnsibleDirector::AnsibleCollectionRole ForemanAnsibleDirector::AnsibleRole],
                desc: N_('Type of the assignable (ForemanAnsibleDirector::AnsibleCollectionRole | ForemanAnsibleDirector::AnsibleRole).'),
                required: true
          param :assignable_namespace,
                String,
                desc: N_('Namespace of the assignable.'),
                example: 'my_namespace',
                required: true
          param :assignable_name,
                String,
                desc: N_('Name of the assignable.'),
                example: 'my_collection',
                required: true
          param :assignable_role_name,
                String,
                desc: N_('Name of the role within the collection (required for AnsibleCollectionRole).'),
                example: 'my_role',
                required: false
          param :target,
                String,
                desc: N_('Target type for the binding (host | hostgroup).'),
                example: 'host',
                required: true
          param :target_id,
                :number,
                desc: N_('ID of the target entity.'),
                example: 1,
                required: true
        end
        # TRANSLATORS: ApiDoc, do not translate!
        example <<~EXAMPLE
          {
            "ansible_variable_binding": {
              "data_type": "string",
              "raw_value": "---\\ntime.example.com",
              "variable_name": "ntp_server",
              "assignable_type": "ForemanAnsibleDirector::AnsibleCollectionRole",
              "assignable_namespace": "my_namespace",
              "assignable_name": "my_collection",
              "assignable_role_name": "my_role",
              "target": "host",
              "target_id": 1
            }
          }
        EXAMPLE
        def update_full
          variable_binding_params = variable_binding_full_params
          validate_yaml! variable_binding_full_params[:raw_value]

          ::ForemanAnsibleDirector::VariableBindingService.edit_variable_binding(
            variable_binding: @ansible_variable_binding,
            **variable_binding_params
          )
        end

        # region ApiDoc: PATCH /api/v2/ansible_director/ansible_variables/bindings/:id
        api :PATCH, '/api/v2/ansible_director/ansible_variables/bindings/:id', N_('Partially update a variable binding')
        description <<~DESC
          Partially update an Ansible variable binding. To update every binding attribute, consider using PUT, which
          informs you of missing attributes.
        DESC
        param :ansible_variable_binding, Hash, desc: N_('Variable binding updates'), required: true do
          param :variable_name,
                String,
                desc: N_('Name of the Ansible variable to bind.'),
                example: 'ntp_server',
                required: false
          param :data_type,
                %w[string integer boolean float array dictionary],
                desc: N_('Data type of the variable.'),
                required: false
          param :raw_value,
                String,
                desc: N_('Value of the variable (must be valid YAML for any type).'),
                example: "---\ntime.example.com",
                required: false
          param :assignable_type,
                %w[ForemanAnsibleDirector::AnsibleCollectionRole ForemanAnsibleDirector::AnsibleRole],
                desc: N_('Type of the assignable (ForemanAnsibleDirector::AnsibleCollectionRole | ForemanAnsibleDirector::AnsibleRole).'),
                example: 'ForemanAnsibleDirector::AnsibleCollectionRole',
                required: false
          param :assignable_namespace,
                String,
                desc: N_('Namespace of the assignable.'),
                example: 'my_namespace',
                required: false
          param :assignable_name,
                String,
                desc: N_('Name of the assignable.'),
                example: 'my_collection',
                required: false
          param :assignable_role_name,
                String,
                desc: N_('Name of the role within the collection (required for AnsibleCollectionRole).'),
                example: 'my_role',
                required: false
          param :target,
                String,
                desc: N_('Target type for the binding (host | hostgroup).'),
                example: 'host',
                required: false
          param :target_id,
                :number,
                desc: N_('ID of the target entity.'),
                example: 1,
                required: false
        end
        # TRANSLATORS: ApiDoc, do not translate!
        example <<~EXAMPLE
          {
            "ansible_variable_binding": {
              "raw_value": "---\\nnew-time.example.com"
            }
          }
        EXAMPLE
        # endregion
        def update_partial
          variable_binding_params = variable_binding_partial_params
          validate_yaml! variable_binding_partial_params[:raw_value]

          ::ForemanAnsibleDirector::VariableBindingService.edit_variable_binding(
            variable_binding: @ansible_variable_binding,
            **variable_binding_params
          )
        end

        # region ApiDoc: DELETE /api/v2/ansible_director/ansible_variables/bindings/:id
        api :DELETE, '/api/v2/ansible_director/ansible_variables/bindings/:id', N_('Delete a variable binding')
        param :id, :number, desc: N_('Variable Binding identifier'), required: true
        # endregion
        def destroy
          ::ForemanAnsibleDirector::VariableBindingService.destroy_variable_binding(@ansible_variable_binding)
        end

        def resource_class
          ::ForemanAnsibleDirector::AnsibleVariableBinding
        end

        def resource_scope
          organization_scoped_resource_scope
        end

        private

        def find_variable
          @ansible_variable = ::ForemanAnsibleDirector::AnsibleVariable.find_by!(id: params[:id])
        end

        def base_params
          root_node = params.require(:ansible_variable_binding)
          root_node.permit(
            :data_type,
            :raw_value,
            :assignable_namespace,
            :assignable_name,
            :assignable_role_name,
            :assignable_type,
            :variable_name,
            :target,
            :target_id
          )
        end

        def variable_binding_create_params
          root_node = base_params
          {
            **variable_binding_full_params,
            assignable_namespace: root_node.require(:assignable_namespace),
            assignable_name: root_node.require(:assignable_name),
            assignable_role_name: if params[:assignable_type] == 'ForemanAnsibleDirector::AnsibleCollectionRole'
                                    root_node.require(:assignable_role_name)
                                  else
                                    root_node[:assignable_role_name]
                                  end,
            assignable_type: root_node.require(:assignable_type),
            target: params[:target] || root_node.require(:target),
            target_id: params[:target_id] || root_node.require(:target_id),
          }
        end

        def variable_binding_full_params
          root_node = base_params
          {
            data_type: root_node.require(:data_type),
            raw_value: root_node.require(:raw_value),
            variable_name: root_node.require(:variable_name),
          }
        end

        def variable_binding_partial_params
          root_node = base_params
          {
            data_type: root_node[:data_type],
            raw_value: root_node[:raw_value],
            variable_name: root_node[:variable_name],
          }.compact
        end

        def validate_yaml!(string)
          YAML.safe_load(string)
        end

        def controller_permission
          'ansible_director_variable_overrides'
        end
      end
    end
  end
end
