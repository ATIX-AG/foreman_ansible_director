# frozen_string_literal: true

collection @assignments

node :id do |assignment|
  assignment.content_unit_version.id
end

node :type do |assignment|
  assignment.content_unit_version.versionable.type == 'AnsibleCollection' ? 'collection' : 'role'
end

node :identifier do |assignment|
  assignment.content_unit_version.versionable.full_name
end

node :version do |assignment|
  assignment.content_unit_version.version
end
