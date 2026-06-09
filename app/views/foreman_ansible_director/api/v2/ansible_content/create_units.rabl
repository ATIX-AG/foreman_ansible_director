# frozen_string_literal: true

extends 'api/v2/common/response', object: @ctx

node(:results) do
  {
    task: {
      id: @bulk_create_task.id,
      label: @bulk_create_task.label,
      started_at: @bulk_create_task.started_at,
    },
  }
end
