# frozen_string_literal: true

class AnsibleCollectionRole < AnsibleDirectorModel
  belongs_to :ansible_collection_version,
    class_name: 'ContentUnitVersion', inverse_of: :ansible_collection_roles

  has_many :ansible_variables, dependent: :destroy

  validates :name, presence: true
  validates :name, uniqueness: { scope: :ansible_collection_version_id }

  validate :ansible_collection_version_must_be_for_collection

  private

  def ansible_collection_version_must_be_for_collection
    return unless ansible_collection_version
    return if ansible_collection_version.versionable_type == 'AnsibleCollection'

    errors.add(:ansible_collection_version, 'must be a version of an AnsibleCollection')
  end
end
