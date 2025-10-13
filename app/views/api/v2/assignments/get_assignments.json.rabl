# frozen_string_literal: true

collection @assignments

attributes :id

node :consumable_id do |assignment|
  assignment.consumable.id
end

node :consumable_name do |assignment|
  assignment.consumable.name
end

node :source_type do |assignment|
  assignment.content_unit_version.versionable.type == 'AnsibleCollection' ? 'collection' : 'role'
end

node :source_identifier do |assignment|
  assignment.content_unit_version.versionable.full_name
end

node :source_id do |assignment|
  assignment.content_unit_version.versionable.id
end

node :source_version do |assignment|
  assignment.content_unit_version.version
end
