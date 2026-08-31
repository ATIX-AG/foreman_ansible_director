# frozen_string_literal: true

module ForemanAnsibleDirector
  module Api
    module V2
      class AnsibleVariableBindingsController < AnsibleDirectorApiController
        before_action :find_resource, only: %w[show destroy update_full update_partial]
        before_action :find_variable, only: [:index_for_variable]
        resource_description { resource_id 'AD Ansible Variable Bindings' }

        # region ApiDoc: POST /api/v2/ansible_director/ansible_variables/:ansible_variable_id/overrides
        api :POST, '/v2/ansible_director/ansible_variables/:ansible_variable_id/overrides',
          N_('Create an override for an Ansible variable')
        # TRANSLATORS: ApiDoc, do not translate!
        description <<~DESC
          Create a new override rule for the specified Ansible variable.
          Overrides allow customizing the variable value for specific hosts, hostgroups, or other matchers.
        DESC
        param :ansible_variable_id,
          :number,
          desc: N_('ID of the Ansible variable to override.'),
          required: true
        param :override, Hash, desc: N_('Override definition'), required: true do
          param :value,
            String,
            desc: N_('Override value (must be valid JSON when the variable type is `json`, `array`, or `hash`).'),
            example: '192.168.1.1',
            required: true
          param :matcher,
            %w[fqdn hostgroup],
            desc: N_('Matcher type.'),
            example: 'fqdn',
            required: true
          param :matcher_value,
            String,
            desc: N_('Value for the matcher (e.g., "myhost.example.com").'),
            example: 'myhost.example.com',
            required: true
        end
        # TRANSLATORS: ApiDoc, do not translate!
        example <<~EXAMPLE
          {
            "override": {
              "value": "prod-ntp.internal",
              "matcher": "fqdn",
              "matcher_value": "prod-web-01.example.com"
            }
          }
        EXAMPLE
        # endregion
        def create_url_params
          override = override_params
          ::ForemanAnsibleDirector::VariableService.create_override(
            variable: @ansible_variable,
            value: override[:value],
            matcher: override[:matcher],
            matcher_value: override[:matcher_value]
          )
        end

        def index_for_variable
        end

        def show
        end

        def create
          binding_params = variable_binding_create_params

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
            assignable_role_name: binding_params[:assignable_role_name]
          )
        end

        def update_full
          variable_binding_params = variable_binding_full_params
          ::ForemanAnsibleDirector::VariableBindingService.edit_variable_binding(
            variable_binding: @ansible_variable_binding,
            **variable_binding_params
          )
        end

        def update_partial
          variable_binding_params = variable_binding_partial_params
          ::ForemanAnsibleDirector::VariableBindingService.edit_variable_binding(
            variable_binding: @ansible_variable_binding,
            **variable_binding_params
          )
        end

        # region ApiDoc: DELETE /api/v2/ansible_director/ansible_variables/:ansible_variable_id/overrides/:id
        api :DELETE, '/v2/ansible_director/ansible_variables/:ansible_variable_id/overrides/:id',
          N_('Delete an override')
        # TRANSLATORS: ApiDoc, do not translate!
        description <<~DESC
          Delete an override rule.
        DESC
        param :ansible_variable_id,
          :number,
          desc: N_('ID of the Ansible variable.'),
          required: true
        param :id,
          :number,
          desc: N_('ID of the override to delete.'),
          required: true
        # endregion
        def destroy
          ::ForemanAnsibleDirector::VariableBindingService.destroy_variable_binding(@ansible_variable_binding)
        end

        def resource_class
          ::ForemanAnsibleDirector::AnsibleVariableBinding
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

        def controller_permission
          'ansible_director_variable_overrides'
        end
      end
    end
  end
end
