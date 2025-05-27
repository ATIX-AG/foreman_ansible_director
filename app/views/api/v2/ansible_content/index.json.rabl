# frozen_string_literal: true

collection @ansible_content_units

attributes :name, :namespace
node :type, &:unit_type
node :identifier do |u|
  "#{u.namespace}.#{u.name}"
end
child content_unit_versions: :versions do
  attributes :version
end
