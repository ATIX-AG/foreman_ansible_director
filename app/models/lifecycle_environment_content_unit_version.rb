# frozen_string_literal: true

class LifecycleEnvironmentContentUnitVersion < PulsibleModel
  belongs_to :lifecycle_environment
  belongs_to :content_unit_version
end
