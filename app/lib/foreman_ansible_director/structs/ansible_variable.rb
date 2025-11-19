# frozen_string_literal: true

module ForemanAnsibleDirector
  module Structs
    module AnsibleVariable
      AnsibleVariableCreate = Struct.new(:key, :type, :default_value)
      AnsibleVariableEdit = Struct.new(:key, :type, :default_value, :overridable)
      AnsibleVariableOverride = Struct.new(:value, :matcher, :matcher_value)
    end
  end
end