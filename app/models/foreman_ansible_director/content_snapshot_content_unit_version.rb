# frozen_string_literal: true

module ForemanAnsibleDirector
  class ContentSnapshotContentUnitVersion < ::ForemanAnsibleDirector::AnsibleDirectorModel
    belongs_to :content_snapshot
    belongs_to :content_unit_version

    validates :content_snapshot_id, uniqueness: { scope: :content_unit_version_id }
  end
end