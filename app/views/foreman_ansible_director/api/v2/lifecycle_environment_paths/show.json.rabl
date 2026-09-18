# frozen_string_literal: true

extends 'api/v2/common/response', object: @ctx

node(:results) do
  @lifecycle_environment_path.render_for_api
end
