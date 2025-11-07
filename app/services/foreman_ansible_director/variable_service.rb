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

      def edit_variable(variable_update, variable)

        ActiveRecord::Base.transaction do
          variable.update!(
            key: variable_update[:key],
            key_type: variable_update[:type],
            default_value: variable_update[:default_value],
            override: variable_update[:overridable]
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

      def edit_override(variable_override, override)

        ActiveRecord::Base.transaction do
          override.update!(
            match: "#{variable_override[:matcher]}=#{variable_override[:matcher_value]}",
            value: variable_override[:value],
          )
        end

      end

      def destroy_override(override)

        ActiveRecord::Base.transaction do
          override.destroy!
        end

      end

      def get_overrides_for_target(target, include_overridable = false)
        ids = target.ansible_content_assignments.pluck(:consumable_id)
        if include_overridable
          sql = <<-SQL
            SELECT lookup_keys.id,
                   lookup_keys.key,
                   lookup_keys.key_type,
                   lookup_keys.default_value,
                   lookup_keys.override,
                   lv.id,
                   lv.match,
                   lv.value
            FROM lookup_keys
            LEFT OUTER JOIN lookup_values lv ON lookup_keys.id = lv.lookup_key_id
            WHERE (lv.match = '#{ActiveRecord::Base.sanitize_sql(matcher(target))}' 
                   OR lookup_keys.override = true)
              AND lookup_keys.ownable_id IN (#{ids.join(',')})
          SQL

          assignment_overrides = ActiveRecord::Base.connection.select_all(sql)
        else
          sql = <<-SQL
            SELECT lookup_keys.id,
                   lookup_keys.key,
                   lookup_keys.key_type,
                   lookup_keys.default_value,
                   lookup_keys.override,
                   lv.id,
                   lv.match,
                   lv.value
            FROM lookup_keys
            LEFT OUTER JOIN lookup_values lv ON lookup_keys.id = lv.lookup_key_id
            WHERE lv.match = '#{ActiveRecord::Base.sanitize_sql(matcher(target))}'
              AND lookup_keys.ownable_id IN (#{ids.join(',')})
          SQL

          assignment_overrides = ActiveRecord::Base.connection.select_all(sql)
        end
        assignment_overrides.rows.map do |row|
          default_value = if row[3] == nil
                            row[3]
                          else
                            if row[2] != "yaml"
                              Foreman::Parameters::Caster.new(nil, :value => YAML.safe_load(row[3]), :to => row[2]).cast
                            else
                              Foreman::Parameters::Caster.new(nil, :value => row[3], :to => row[2]).cast
                            end
                          end

          override_value = if row[7] == nil
                             row[7]
                           else
                             if row[2] != "yaml"
                               Foreman::Parameters::Caster.new(nil, :value => YAML.safe_load(row[7]), :to => row[2]).cast
                             else
                               Foreman::Parameters::Caster.new(nil, :value => row[7], :to => row[2]).cast
                             end
                           end
          {
          variable_id: row[0],
          key: row[1],
          key_type: row[2],
          default_value: default_value,
          overridable: row[4],
          override_id: row[5],
          override_matcher: row[6],
          override_value: override_value,
        }
        end
      end

      private

      def matcher(target)
        case target
        when Host::Managed
          return "fqdn=#{target.fqdn}"
        when Hostgroup
          return "hostgroup=#{target.name}"
        else
          raise NotImplementedError, "Unexpected class #{target.class}"
        end
      end

    end
  end
end