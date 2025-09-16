
class LifecycleEnvironmentHost < AnsibleDirectorModel
  belongs_to :lifecycle_environment
  belongs_to :host
end