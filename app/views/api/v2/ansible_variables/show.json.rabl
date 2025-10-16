object @ansible_variable

attributes :id, :name, :default_value, :key_type

child :lookup_values => :overrides do
  attributes :id, :value, :match
end