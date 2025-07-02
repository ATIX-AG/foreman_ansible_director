# frozen_string_literal: true

object @lifecycle_environment

attributes :id, :name, :description, :position, :content_hash

child :execution_environment do
  attributes :id, :name
end

child content_unit_versions: :content do
  attributes :id

  node :content_unit_type do |lcecu|
    lcecu.versionable.type
  end

  node :content_unit_namespace do |lcecu|
    lcecu.versionable.namespace
  end

  node :content_unit_name do |lcecu|
    lcecu.versionable.name
  end

  node :content_unit_version do |lcecu|
    lcecu.version
  end
end
