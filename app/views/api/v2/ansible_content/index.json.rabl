# frozen_string_literal: true

collection @ansible_content_units

attributes :name, :namespace
child ansible_content_versions: :versions do
  attributes :version
end
