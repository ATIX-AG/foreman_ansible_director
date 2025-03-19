# frozen_string_literal: true

collection @ansible_content_units => :results

attributes :name, :namespace
child ansible_content_versions: :versions do
  attributes :version
end
