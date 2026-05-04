# frozen_string_literal: true

node(:status) do
  @ctx.response_status
end

node(:errors) do
  @ctx.response_errors
end

node(:warnings) do
  @ctx.response_warnings
end

node(:updated) do
  @ctx.updated
end

node(:created) do
  @ctx.response_created
end

node(:deleted) do
  @ctx.response_deleted
end
