# frozen_string_literal: true

module ForemanAnsibleDirector
  module Api
    module V2
      class AnsibleVariableOverridesController < AnsibleDirectorApiController
        before_action :find_variable, only: %i[create]
        before_action :find_override, only: %i[update destroy]

        resource_description do
          resource_id 'ansible_variable_overrides'
          api_version 'v2'
          api_base_url '/ansible_director'
        end

        api :GET, '/ansible_variables/overrides/:target/:target_id',
          N_('List variable overrides for a target')
        param :target, String, required: true, desc: N_('Target type')
        param :target_id, :identifier_dottable, required: true
        param :include_overridable, :bool, required: false,
          desc: N_('Include overridable variables')

        def index_for_target
          target = ::ForemanAnsibleDirector::AssignmentService.find_target(
            target_type: params[:target],
            target_id: params[:target_id]
          )
          include_overridable = ::Foreman::Cast.to_bool(params[:include_overridable])
          @target_overrides = ::ForemanAnsibleDirector::VariableService.get_overrides_for_target target,
            include_overridable: include_overridable
        end

        api :POST, '/ansible_variables/:ansible_variable_id/overrides', N_('Create variable override')
        param :ansible_variable_id, :identifier_dottable, required: true
        param :override, Hash, required: true do
          param :value, String, required: false
          param :matcher, String, required: false
          param :matcher_value, String, required: false
          param :overridable, :bool, required: false
        end

        def create
          override = override_params
          ::ForemanAnsibleDirector::VariableService.create_override(
            variable: @ansible_variable,
            value: override[:value],
            matcher: override[:matcher],
            matcher_value: override[:matcher_value]
          )
        end

        api :PUT, '/ansible_variables/:ansible_variable_id/overrides/:id', N_('Update variable override')
        param :ansible_variable_id, :identifier_dottable, required: true
        param :id, :identifier_dottable, required: true
        param :override, Hash, required: true do
          param :value, String, required: false
          param :matcher, String, required: false
          param :matcher_value, String, required: false
          param :overridable, :bool, required: false
        end

        def update
          override = override_params
          ::ForemanAnsibleDirector::VariableService.edit_override(
            override: @override,
            value: override[:value],
            matcher: override[:matcher],
            matcher_value: override[:matcher_value]
          )
        end

        api :DELETE, '/ansible_variables/:ansible_variable_id/overrides/:id', N_('Delete variable override')
        param :ansible_variable_id, :identifier_dottable, required: true
        param :id, :identifier_dottable, required: true

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
      end
    end
  end
end
