# frozen_string_literal: true

class ContentUnitVersion < PulsibleModel
  belongs_to :versionable, polymorphic: true
  has_many :ansible_collection_roles, dependent: :destroy
  has_many :execution_environment_content_units, dependent: :destroy

  validates :version, presence: true
  validates :version, uniqueness: { scope: %i[versionable_type versionable_id] }

  scope :collection_versions, -> { where(versionable_type: 'AnsibleCollection') }
  scope :role_versions, -> { where(versionable_type: 'AnsibleRole') }
end
