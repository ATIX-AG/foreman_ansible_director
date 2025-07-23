# frozen_string_literal: true

collection @ansible_content_units

attributes :id, :name, :namespace, :type
node :identifier, &:full_name
child content_unit_versions: :versions do
  attributes :version
end
