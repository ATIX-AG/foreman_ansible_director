# frozen_string_literal: true

object @ansible_variable

attributes :id, :default_value

node :name, &:key

node :type, &:key_type

node :overriable, &:overridable?

child lookup_values: :overrides do
  attributes :id, :value
  node :value, &:value_before_type_cast
  node :matcher do |lookup_value|
    lookup_value.match.split('=').first
  end
  node :matcher_value do |lookup_value|
    lookup_value.match.split('=').last
  end
end
