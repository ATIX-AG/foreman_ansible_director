# frozen_string_literal: true

module ForemanAnsibleDirector
  class AnsibleVariable < LookupKey
    belongs_to :ansible_role, optional: true
    belongs_to :ansible_collection_role, optional: true

    def default_value=(value)
      super(
        if value.is_a?(ActiveSupport::HashWithIndifferentAccess)
          value.to_h
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
