# frozen_string_literal: true

module ForemanAnsibleDirector
  class LifecycleEnvironmentHost < ::ForemanAnsibleDirector::AnsibleDirectorModel
    belongs_to :lifecycle_environment
    belongs_to :host
  end
  # TODO: Delete class - LCEs are assigned to hosts via fk in Hosts
end
