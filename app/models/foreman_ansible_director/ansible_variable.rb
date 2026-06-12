# frozen_string_literal: true

module ForemanAnsibleDirector
  class AnsibleVariable < LookupKey
    belongs_to :ansible_role, optional: true
    belongs_to :ansible_collection_role, optional: true

    scope :with_lookup_values, -> { where.associated(:lookup_values) }

    scope :overridables, lambda {
      where(override: true)
        .or(where(id: with_lookup_values.select(:id)))
    }

    def default_value=(value)
      super(
        if value.is_a?(ActiveSupport::HashWithIndifferentAccess)
          value.to_hash
        else
          value
        end
      )
    end

    def overridable?
      override || lookup_values.count.positive?
    end
  end
end
