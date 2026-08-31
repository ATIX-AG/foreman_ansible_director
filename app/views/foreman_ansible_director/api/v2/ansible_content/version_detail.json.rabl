# frozen_string_literal: true

extends 'api/v2/common/response', object: @ctx

node(:results) do
  @content_unit_version.render_for_api
end
