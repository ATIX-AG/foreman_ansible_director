# frozen_string_literal: true

class ContentUnitVersion < AnsibleDirectorModel
  belongs_to :versionable, polymorphic: true
  has_many :ansible_collection_roles, dependent: :destroy, foreign_key: 'ansible_collection_version_id',
           inverse_of: :ansible_collection_version

  has_many :execution_environment_content_units, dependent: :destroy

  #has_many :lifecycle_environment_content_assignments, dependent: :destroy
  #has_many :assigned_lifecycle_environments,
  #  through: :lifecycle_environment_content_assignments,
  #  source: :lifecycle_environment

  has_many :ansible_content_assignments, as: :consumable, dependent: :destroy

  validates :version, presence: true
  validates :version, uniqueness: { scope: %i[versionable_type versionable_id] }

  scope :collection_versions, -> { where(versionable_type: 'AnsibleCollection') }
  scope :role_versions, -> { where(versionable_type: 'AnsibleRole') }
end
