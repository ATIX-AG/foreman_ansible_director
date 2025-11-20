# frozen_string_literal: true

module ForemanAnsibleDirector
  class AnsibleDirectorModel < ApplicationRecord
    self.abstract_class = true
    self.table_name_prefix = 'ad_'

    def self.table_name
      table_name = model_name.route_key
      "#{self.table_name_prefix}#{table_name}"
    end

    def flatten_errors
      errors.messages.map { |attribute, messages| messages.map { |msg| "#{attribute}: #{msg}" } }.flatten.join("\n")
    end
  end
end
