# frozen_string_literal: true

object @lifecycle_environment

attributes :id, :name, :description, :position, :content_hash

node :execution_environment do |object|
  if object.execution_environment
    {
      id: object.execution_environment.id,
      name: object.execution_environment.name,
    }
  end
end

node :content do |object|
  if object.content_unit_versions.empty?
    []
  else
    object.content_unit_versions.map do |lcecu|
      {
        id: lcecu.versionable.id,
        type: lcecu.content_unit_type,
        identifier: lcecu.versionable.full_name,
        version: lcecu.version,
        roles:  lcecu.content_unit_type == 'collection' ? (lcecu.ansible_collection_roles.map { |role| { id: role.id, name: role.name } }) :[],
      }
    end
  end
end
