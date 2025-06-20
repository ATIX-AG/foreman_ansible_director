# frozen_string_literal: true

collection @lifecycle_environment_paths

attributes :id, :name, :description

child environments_ordered: :lifecycle_environments do
  attributes :id, :name, :description, :position, :protected
end
