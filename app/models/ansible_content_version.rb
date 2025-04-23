# frozen_string_literal: true

class AnsibleContentVersion < PulsibleModel
  belongs_to :versionable, polymorphic: true

  has_many :ansible_content_versions, through: :execution_environment_content_versions
  has_many :execution_environment_content_versions, dependent: :destroy
end
