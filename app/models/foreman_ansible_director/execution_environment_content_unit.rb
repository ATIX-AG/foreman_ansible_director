# frozen_string_literal: true

module ForemanAnsibleDirector
  class ExecutionEnvironmentContentUnit < ::ForemanAnsibleDirector::AnsibleDirectorModel
    belongs_to :execution_environment
    belongs_to :content_unit
    belongs_to :content_unit_version

    validates :execution_environment, presence: true
    validates :content_unit, presence: true
    validates :content_unit_version, presence: true
    validates :content_unit_id, uniqueness: { scope: :execution_environment_id }

    validate :version_belongs_to_content_unit

    private

    def version_belongs_to_content_unit
      if content_unit_version.present? && content_unit.present? &&
         content_unit_version.versionable != content_unit
        errors.add(:content_unit_version, 'must belong to the specified content unit')
      end
    end
  end
end
