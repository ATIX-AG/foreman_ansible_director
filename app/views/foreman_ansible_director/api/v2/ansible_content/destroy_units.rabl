# frozen_string_literal: true

extends 'api/v2/common/response', object: @ctx

node(:results) do
  {
    task: {
      id: @bulk_destroy_task.id,
      label: @bulk_destroy_task.label,
      started_at: @bulk_destroy_task.started_at,
    },
  }
end
