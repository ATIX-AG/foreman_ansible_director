# frozen_string_literal: true

collection @ansible_content_units

attributes :id, :name, :namespace, :type
node :identifier do |u|
  u.full_name
end
child content_unit_versions: :versions do
  attributes :version
end
