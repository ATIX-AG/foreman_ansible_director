# frozen_string_literal: true

module ForemanAnsibleDirector
  module Api
    module V2
      class AnsibleVariableOverridesController < AnsibleDirectorApiController
        before_action :find_variable, only: %i[create]
        before_action :find_override, only: %i[update destroy]

        resource_description { resource_id 'AD Ansible Variable Overrides' }

        # region ApiDoc: GET /api/v2/ansible_director/ansible_variables/:ansible_variable_id/overrides
        api :GET, '/v2/ansible_director/ansible_variables/:ansible_variable_id/overrides',
          N_('List overrides for a target')
        # TRANSLATORS: ApiDoc, do not translate!
        description <<~DESC
          List override values associated with a given target (host or hostgroup).
          Overrides are matched at runtime based on the predefined hierarchy: Default -> Hostgroup -> Host.
        DESC
        param :target,
          %w[HOST HOSTGROUP],
          desc: N_('Type of the target entity.'),
          required: true
        param :target_id,
          :number,
          desc: N_('ID of the target entity.'),
          required: true
        param :include_overridable,
          [true, false],
          desc: N_('Whether to include overridable variables in the response.'),
          example: false,
          required: false
        # endregion
        def index_for_target
          target = ::ForemanAnsibleDirector::AssignmentService.find_target(
            target_type: params[:target],
            target_id: params[:target_id]
          )
          include_overridable = ::Foreman::Cast.to_bool(params[:include_overridable])
          @target_overrides = ::ForemanAnsibleDirector::VariableService.get_overrides_for_target target,
            include_overridable: include_overridable
        end

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
        def create
          override = override_params
          ::ForemanAnsibleDirector::VariableService.create_override(
            variable: @ansible_variable,
            value: override[:value],
            matcher: override[:matcher],
            matcher_value: override[:matcher_value]
          )
        end

        # region ApiDoc: PUT /api/v2/ansible_director/ansible_variables/:ansible_variable_id/overrides/:id
        api :PUT, '/v2/ansible_director/ansible_variables/:ansible_variable_id/overrides/:id', N_('Update an override')
        # TRANSLATORS: ApiDoc, do not translate!
        description <<~DESC
          Update an existing override rule.
        DESC
        param :ansible_variable_id,
          :number,
          desc: N_('ID of the Ansible variable.'),
          required: true
        param :id,
          :number,
          desc: N_('ID of the override to update.'),
          required: true
        param :override, Hash, desc: N_('Override update'), required: true do
          param :value,
            String,
            desc: N_('New override value.'),
            example: 'backup-ntp.internal',
            required: false
          param :matcher,
            String,
            desc: N_('New matcher type (e.g., "hostgroup").'),
            example: 'hostgroup',
            required: false
          param :matcher_value,
            String,
            desc: N_('New matcher value (e.g., "my_hostgroup").'),
            example: 'my_hostgroup',
            required: false
        end
        # TRANSLATORS: ApiDoc, do not translate!
        example <<~EXAMPLE
          {
            "override": {
              "value": "staging-ntp.internal",
              "matcher": "hostgroup",
              "matcher_value": "Staging"
            }
          }
        EXAMPLE
        # endregion
        def update
          override = override_params
          ::ForemanAnsibleDirector::VariableService.edit_override(
            override: @override,
            value: override[:value],
            matcher: override[:matcher],
            matcher_value: override[:matcher_value]
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
          ::ForemanAnsibleDirector::VariableService.destroy_override(@override)
        end

        private

        def override_params
          params.require(:override).permit(:value, :matcher, :matcher_value, :overridable)
        end

        def find_override
          find_variable
          @override = @ansible_variable.lookup_values.find(params[:id])
          return if @override
          render_error(
            'custom_error',
            status: :unprocessable_entity,
            locals: {
              message: "Couldn't find ansible variable override #{params[:id]}",
            }
          )
        end

        def find_variable
          @ansible_variable = ::ForemanAnsibleDirector::AnsibleVariable.find(params[:ansible_variable_id])
          return if @ansible_variable
          render_error(
            'custom_error',
            status: :unprocessable_entity,
            locals: {
              message: "Couldn't find ansible variable #{params[:ansible_variable_id]}",
            }
          )
        end

        def controller_permission
          'ansible_director_variable_overrides'
        end
      end
    end
  end
end
