# frozen_string_literal: true

module ForemanAnsibleDirector
  class LifecycleEnvironmentContentUnitVersion < ::ForemanAnsibleDirector::AnsibleDirectorModel
    belongs_to :lifecycle_environment
    belongs_to :content_unit_version

    def cuv_id
      content_unit_version.id
    end
    # TODO: Delete class - Assignments are handled via generic assignment model
  end
end
