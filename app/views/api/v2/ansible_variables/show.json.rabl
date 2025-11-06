object @ansible_variable

attributes :id, :default_value

node :name do |ansible_variable|
  ansible_variable.key
end

node :type do |ansible_variable|
  ansible_variable.key_type
end

node :overriable do |ansible_variable|
  ansible_variable.overridable?
end

child :lookup_values => :overrides do
  attributes :id, :value
  node :value do |lookup_value|
    lookup_value.value_before_type_cast
  end
  node :matcher do |lookup_value|
    lookup_value.match.split('=').first
  end
  node :matcher_value do |lookup_value|
    lookup_value.match.split('=').last
  end
end