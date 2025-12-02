# frozen_string_literal: true

module ForemanAnsibleDirector
  module Structs
    module LifecycleEnvironmentPath
      LifecycleEnvironmentPathCreate = Struct.new(:name, :description, :organization_id)
      LifecycleEnvironmentPathEdit = Struct.new(:name, :description)
      LifecycleEnvironmentPathPromote = Struct.new(:source_environment_id, :target_environment_id)
    end
  end
end
