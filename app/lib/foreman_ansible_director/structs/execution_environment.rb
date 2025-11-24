module ForemanAnsibleDirector
  module Structs
    module ExecutionEnvironment
      ExecutionEvironmentCreate = Struct.new(:name, :base_image_url, :ansible_version, :organization_id)
      ExecutionEnvironmentEdit = Struct.new(:name, :base_image_url, :ansible_version)
    end
  end
end