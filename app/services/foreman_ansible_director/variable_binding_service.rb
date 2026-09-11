# frozen_string_literal: true

module ForemanAnsibleDirector
  class VariableBindingService < AnsibleDirectorService
    class << self
      def create_variable_binding(variable_name:,
                                  data_type:,
                                  raw_value:,
                                  target:,
                                  assignable_type:,
                                  assignable_namespace:,
                                  assignable_name:,
                                  assignable_role_name:,
                                  query: 0,
                                  query_data: {},
                                  transformer: 0,
                                  transformer_data: {})
        ActiveRecord::Base.transaction do
          ::ForemanAnsibleDirector::AnsibleVariableBinding.create!(
            variable_name: variable_name,
            raw_value: raw_value,
            data_type: data_type,
            query: query,
            query_data: query_data,
            transformer: transformer,
            transformer_data: transformer_data,
            assignable_type: assignable_type,
            assignable_namespace: assignable_namespace,
            assignable_name: assignable_name,
            assignable_role_name: assignable_role_name,
            consumable: target
          )
        end
      end

      def edit_variable_binding(variable_binding:,
                                **args)
        ActiveRecord::Base.transaction do
          variable_binding.update!(
            args
          )
        end
      end

      def destroy_variable_binding(binding)
        ActiveRecord::Base.transaction do
          binding.destroy!
        end
      end
    end
  end
end
