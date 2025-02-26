# frozen_string_literal: true

class AnsibleCollection < AnsibleContentUnit
  has_many :ansible_content_versions, as: :versionable
end
