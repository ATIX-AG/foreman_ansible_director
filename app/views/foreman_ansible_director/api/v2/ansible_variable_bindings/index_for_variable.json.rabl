# frozen_string_literal: true

extends 'api/v2/common/response', object: @ctx

node(:results) do
  {
    bindings: @ansible_variable.bound_by.map(&:render_for_api),
  }
end
