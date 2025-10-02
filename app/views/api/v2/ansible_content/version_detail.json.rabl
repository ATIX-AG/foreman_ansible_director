# frozen_string_literal: true

object @content_unit_version

node :roles do |acv|
  acv.ansible_collection_roles.map do |role|
    {
      name: role.name,
      variables: role.ansible_variables.map do |var|
        {
          name: var.key,
          default_value: var.default_value,
          type: var.key_type,
        }
      end
    }
  end
end