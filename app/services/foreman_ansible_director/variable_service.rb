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
        case target
        when Host::Managed
          host = target
        when Hostgroup
          host = Host.new
          host.hostgroup = target
        else
          raise NotImplementedError, "Unexpected class #{target.class}"
        end

        _, resolved_assignments, = ::ForemanAnsibleDirector::AssignmentService.assignments_for(
          target: target,
          resolve: true
        )
        return [] if resolved_assignments.blank?

        variables = []
        resolved_assignments.each do |content_assignment|
          consumable = content_assignment[:cuv]
          next unless consumable

          variable_owner = variable_owner_for(consumable)
          next unless variable_owner

          overridables = ::ForemanAnsibleDirector::AnsibleVariable.where(
            ownable_type: variable_owner.class.name,
            ownable_id: variable_owner.id
          ).overridables
          overrides = overridables.values_hash(host).raw

          overridables.each do |variable|
            resolved_override = overrides.dig(variable.id, variable.key)
            next if resolved_override.nil? && !include_overridable

            override_matcher = matcher_for(resolved_override)

            variables << {
              variable_id: variable.id,
              key: variable.key,
              key_type: variable.key_type,
              default_value: variable.default_value,
              overridable: variable.overridable?,
              override_id: LookupValue.find_by(match: override_matcher, lookup_key_id: variable.id)&.id,
              override_matcher: override_matcher,
              override_value: resolved_override&.dig(:value),
            }
          end
        end

        variables
      end

      private

      def variable_owner_for(consumable)
        if consumable.is_a?(::ForemanAnsibleDirector::ContentUnitVersion)
          consumable.versionable
        else
          consumable
        end
      end

      def matcher_for(resolved_override)
        return if resolved_override.blank?

        element = resolved_override[:element]
        element_name = resolved_override[:element_name]
        return if element.blank? || element_name.blank?

        "#{element}=#{element_name}"
      end
    end
  end
end
