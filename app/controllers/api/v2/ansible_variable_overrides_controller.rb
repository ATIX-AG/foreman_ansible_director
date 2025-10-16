# frozen_string_literal: true

module Api
  module V2
    class AnsibleVariableOverridesController < AnsibleDirectorApiController
      before_action :find_variable, only: %i[create]
      before_action :find_override, only: %i[destroy]


      def create
        override = override_params
        create = Structs::AnsibleVariable::AnsibleVariableOverride.new(override[:value], override[:matcher], override[:matcher_value])
        ::ForemanAnsibleDirector::VariableService.create_override(create, @ansible_variable)
      end

      def destroy
        ::ForemanAnsibleDirector::VariableService.destroy_override(@override)
      end

      private

      def override_params
        params.require(:override).permit(:value, :matcher, :matcher_value)
      end

      def find_override
        find_variable
        @override = @ansible_variable.lookup_values.find(params[:id])
        unless @override
          render_error('custom_error', status: :unprocessable_entity,
                       locals: { message: "Couldn't find ansible variable override #{params[:id]}" })
        end

      end

      def find_variable
        @ansible_variable = AnsibleVariable.find(params[:ansible_variable_id])
        unless @ansible_variable
          render_error('custom_error', status: :unprocessable_entity,
                        locals: { message: "Couldn't find ansible variable #{params[:ansible_variable_id]}" })
        end
      end

    end
  end
end
