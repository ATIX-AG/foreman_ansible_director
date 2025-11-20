# frozen_string_literal: true

class LifecycleEnvironmentContentUnitVersion < AnsibleDirectorModel
  belongs_to :lifecycle_environment
  belongs_to :content_unit_version

  def cuv_id
    content_unit_version.id
  end
end
