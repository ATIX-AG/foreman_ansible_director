# frozen_string_literal: true

extends 'api/v2/common/response', object: @ctx

node(:results) do
  @ansible_variable.render_for_api
end
