# frozen_string_literal: true

extends 'api/v2/common/response', object: @ctx

node(:results) do
  {
    variables: @collection_role.ansible_variables.map(&:render_for_api),
  }
end
