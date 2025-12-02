# frozen_string_literal: true

module ForemanAnsibleDirector
  module Structs
    module LifecycleEnvironment
      LifecycleEnvironmentCreate = Struct.new(:name, :description, :position, :organization_id)
      LifecycleEnvironmentEdit = Struct.new(:name, :description, :execution_environment_id)
    end
  end
end
