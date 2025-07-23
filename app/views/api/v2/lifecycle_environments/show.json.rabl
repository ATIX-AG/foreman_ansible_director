# frozen_string_literal: true

object @lifecycle_environment

attributes :id, :name, :description, :position, :content_hash

child :execution_environment do
  attributes :id, :name
end

child content_unit_versions: :content do
  node :id do |lcecu|
    lcecu.versionable.id
  end

  node :type do |lcecu|
    lcecu.versionable.type == 'AnsibleCollection' ? 'collection' : 'role'
  end

  node :identifier do |lcecu|
    lcecu.versionable.full_name
  end

  node :version, &:version
end
