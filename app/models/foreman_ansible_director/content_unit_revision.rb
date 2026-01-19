# frozen_string_literal: true

module ForemanAnsibleDirector
  class ContentUnitRevision < ::ForemanAnsibleDirector::AnsibleDirectorModel


    belongs_to :content_unit_version

    has_many :ansible_collection_roles, dependent: :destroy, foreign_key: 'ansible_collection_version_id',
             inverse_of: :ansible_collection_version

  end
end
