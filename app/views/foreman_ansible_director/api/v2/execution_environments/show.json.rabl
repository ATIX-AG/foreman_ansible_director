# frozen_string_literal: true

extends 'api/v2/common/response', object: @ctx

node(:results) do
  @execution_environment.render_for_api
end
