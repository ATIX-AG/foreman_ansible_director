
module Structs
  module AnsibleVariable
    AnsibleVariableCreate = Struct.new(:key, :type, :default_value)
    AnsibleVariableOverride = Struct.new(:value, :matcher, :matcher_value)
  end
end