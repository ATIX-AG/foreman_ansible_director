# frozen_string_literal: true

collection @execution_environments

attributes :id, :name, :base_image_url, :ansible_version, :image_hash, :image_url, :last_built
child ansible_content_versions: :content do
  attributes :id

  node :content_unit_type do |acv|
    acv.versionable.unit_type
  end

  node :content_unit_namespace do |acv|
    acv.versionable.namespace
  end

  node :content_unit_name do |acv|
    acv.versionable.name
  end

  attributes version: :content_unit_version
end
