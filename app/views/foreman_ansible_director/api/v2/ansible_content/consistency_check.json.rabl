# frozen_string_literal: true

extends 'api/v2/common/response', object: @ctx

node(:results) do
  {
    task: {
      id: @consistency_check.id,
      label: @consistency_check.label,
      started_at: @consistency_check.started_at,
    },
  }
end
