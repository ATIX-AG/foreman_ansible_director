# frozen_string_literal: true

collection @execution_environments

attributes :id, :name, :base_image_url, :ansible_version, :image_hash, :image_url, :last_built

child execution_environment_content_units: :content do
  attributes :id

  node :content_unit_type do |eecu|
    eecu.content_unit.type
  end

  node :content_unit_namespace do |eecu|
    eecu.content_unit.namespace
  end

  node :content_unit_name do |eecu|
    eecu.content_unit.name
  end

  node :content_unit_version do |eecu|
    eecu.content_unit_version.version
  end
end
