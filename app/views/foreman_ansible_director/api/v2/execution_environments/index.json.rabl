# frozen_string_literal: true

collection @execution_environments

attributes :id, :name, :base_image_url, :ansible_version, :image_hash, :image_url, :last_built

child execution_environment_content_units: :content do
  node :id do |eecu|
    eecu.content_unit.id
  end

  node :type do |eecu|
    eecu.content_unit.type == 'AnsibleCollection' ? 'collection' : 'role'
  end

  node :identifier do |eecu|
    eecu.content_unit.full_name
  end

  node :version do |eecu|
    eecu.content_unit_version.version
  end
end
