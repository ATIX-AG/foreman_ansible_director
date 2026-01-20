# frozen_string_literal: true

module ForemanAnsibleDirector
  class VariableService
    class << self
      def create_variable(key:,
                          type:,
                          default_value:,
                          owner:)
        ActiveRecord::Base.transaction do
          ::ForemanAnsibleDirector::AnsibleVariable.create!(
            key: key,
            default_value: default_value,
            variable_type: type,
            ownable: owner
          )
        end
      end

      def edit_variable(variable:,
                        key:,
                        type:,
                        default_value:,
                        overridable:)
        ActiveRecord::Base.transaction do
          variable.update!(
            key: key,
            key_type: type,
            default_value: default_value,
            override: overridable
          )
        end
      end

      def create_override(variable:,
                          value:,
                          matcher:,
                          matcher_value:)
        ActiveRecord::Base.transaction do
          LookupValue.create!(
            match: "#{matcher}=#{matcher_value}",
            value: value,
            lookup_key_id: variable.id
          )
        end
      end

      def edit_override(override:,
                        value:,
                        matcher:,
                        matcher_value:)
        ActiveRecord::Base.transaction do
          override.update!(
            match: "#{matcher}=#{matcher_value}",
            value: value
          )
        end
      end

      def destroy_override(override)
        ActiveRecord::Base.transaction do
          override.destroy!
        end
      end

      def get_overrides_for_target(target, include_overridable: false)
        matcher_value = matcher(target)
        ids = target.ansible_content_assignments.pluck(:consumable_id)
        return [] unless ids.length.positive?
        sql = if include_overridable
                <<-SQL
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
            WHERE (lv.match = '#{ActiveRecord::Base.sanitize_sql(matcher_value)}'
                   OR lookup_keys.override = true)
              AND lookup_keys.ownable_id IN (#{ids.join(',')})
                SQL

              else
                <<-SQL
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
            WHERE lv.match = '#{ActiveRecord::Base.sanitize_sql(matcher_value)}'
              AND lookup_keys.ownable_id IN (#{ids.join(',')})
                SQL

              end
        assignment_overrides = ActiveRecord::Base.connection.select_all(sql)
        assignment_overrides.rows.map do |row|
          default_value = if row[3].nil?
                            row[3]
                          elsif row[2] != 'yaml'
                            Foreman::Parameters::Caster.new(nil, value: YAML.safe_load(row[3]), to: row[2]).cast
                          else
                            Foreman::Parameters::Caster.new(nil, value: row[3], to: row[2]).cast
                          end

          override_value = if row[7].nil?
                             row[7]
                           elsif row[2] != 'yaml'
                             Foreman::Parameters::Caster.new(nil, value: YAML.safe_load(row[7]),
to: row[2]).cast
                           else
                             Foreman::Parameters::Caster.new(nil, value: row[7], to: row[2]).cast
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
          "fqdn=#{target.fqdn}"
        when Hostgroup
          "hostgroup=#{target.name}"
        else
          raise NotImplementedError, "Unexpected class #{target.class}"
        end
      end
    end
  end
end
