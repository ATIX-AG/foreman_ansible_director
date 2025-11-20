# frozen_string_literal: true

collection @ansible_content_units

attributes :id, :name, :namespace
node :type do |acu|
  acu.type == 'ForemanAnsibleDirector::AnsibleCollection' ? 'collection' : 'role'
end
node :identifier, &:full_name
child content_unit_versions: :versions do
  attributes :id, :version
  node :roles_count do |acv|
    acv.ansible_collection_roles.count == 0 ? 1 : acv.ansible_collection_roles.count
  end
end
