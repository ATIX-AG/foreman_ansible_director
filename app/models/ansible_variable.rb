# frozen_string_literal: true

class AnsibleVariable < LookupKey
  belongs_to :ansible_role, optional: true
  belongs_to :ansible_collection_role, optional: true
end
