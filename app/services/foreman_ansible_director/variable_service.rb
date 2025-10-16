module ForemanAnsibleDirector
  class VariableService
    class << self
      def create_variable(variable_create, owner)

        ActiveRecord::Base.transaction do
          AnsibleVariable.create!(
            key: variable_create[:key],
            default_value: variable_create[:default_value],
            variable_type: variable_create[:type],
            ownable: owner
          )
        end

      end

      def create_override(variable_override, variable)

        ActiveRecord::Base.transaction do
          LookupValue.create!(
            match: "#{variable_override[:matcher]}=#{variable_override[:matcher_value]}",
            value: variable_override[:value],
            lookup_key_id: variable.id
          )
        end

      end

      def destroy_override(override)

        ActiveRecord::Base.transaction do
          override.destroy!
        end

      end
    end
  end
end