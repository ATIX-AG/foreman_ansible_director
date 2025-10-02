module ForemanAnsibleDirector
  class VariableService
    class << self
      def create_variable(variable_create, owner)

        ActiveRecord::Base.transaction do
          AnsibleVariable.create(
            key: variable_create[:key],
            default_value: variable_create[:default_value],
            variable_type: variable_create[:type],
            ownable: owner
          )
        end

      end
    end
  end
end