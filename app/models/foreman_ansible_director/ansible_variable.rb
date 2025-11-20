# frozen_string_literal: true

module ForemanAnsibleDirector
  class AnsibleVariable < LookupKey
    belongs_to :ansible_role, optional: true
    belongs_to :ansible_collection_role, optional: true

    def overridable?
      override || lookup_values.count > 0
    end
  end
end