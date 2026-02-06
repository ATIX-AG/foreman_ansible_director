# frozen_string_literal: true

module ForemanAnsibleDirector
  module Api
    module V2
      class AnsibleVariableOverridesController < AnsibleDirectorApiController
        before_action :find_variable, only: %i[create]
        before_action :find_override, only: %i[update destroy]

        def index_for_target
          target = ::ForemanAnsibleDirector::AssignmentService.find_target(
            target_type: params[:target],
            target_id: params[:target_id]
          )
          include_overridable = ::Foreman::Cast.to_bool(params[:include_overridable])
          @target_overrides = ::ForemanAnsibleDirector::VariableService.get_overrides_for_target target,
            include_overridable: include_overridable
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

        def update
          override = override_params
          ::ForemanAnsibleDirector::VariableService.edit_override(
            override: @override,
            value: override[:value],
            matcher: override[:matcher],
            matcher_value: override[:matcher_value]
          )
        end

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
