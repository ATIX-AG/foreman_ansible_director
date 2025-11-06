# frozen_string_literal: true

collection @target_overrides


node :variable_id do |override|
  override[:variable_id]
end

node :key do |override|
  override[:key]
end

node :type do |override|
  override[:key_type]
end

node :default_value do |override|
  override[:default_value]
end

node :overridable do |override|
  override[:overridable]
end

node :override_id do |override|
  override[:override_id]
end

node :override_matcher do |override|
  override[:override_matcher]
end

node :override_value do |override|
  override[:override_value]
end
