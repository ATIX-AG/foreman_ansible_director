# frozen_string_literal: true

class AnsibleRole < AnsibleContentUnit
  has_many :ansible_content_versions, as: :versionable, dependent: :destroy
  belongs_to :organization, inverse_of: :ansible_roles
end
