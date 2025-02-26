# frozen_string_literal: true

class AnsibleRole < AnsibleContentUnit
    has_many :ansible_content_versions, as: :versionable
end
