
module Structs
  module AnsibleVariable
    AnsibleVariableCreate = Struct.new(:key, :type, :default_value)
  end
end