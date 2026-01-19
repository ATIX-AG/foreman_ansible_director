# frozen_string_literal: true

module ForemanAnsibleDirector
  class AnsibleCollectionRole < ::ForemanAnsibleDirector::AnsibleDirectorModel
    include ::ForemanAnsibleDirector::Concerns::VariableOwner

    belongs_to :ansible_collection_version,
      class_name: 'ContentUnitVersion', inverse_of: :ansible_collection_roles, optional: true

    belongs_to :content_unit_revision, class_name: 'ContentUnitRevision', inverse_of: :ansible_collection_roles,
                optional: true

    validates :name, presence: true
    validates :name, uniqueness: { scope: :ansible_collection_version_id }

    validate :ansible_collection_version_must_be_for_collection

    private

    def ansible_collection_version_must_be_for_collection
      return unless ansible_collection_version
      return if ansible_collection_version.versionable_type == 'ForemanAnsibleDirector::AnsibleCollection'

      errors.add(:ansible_collection_version, 'must be a version of an ForemanAnsibleDirector::AnsibleCollection')
    end
  end
end
