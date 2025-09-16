# frozen_string_literal: true

class AnsibleDirectorModel < ApplicationRecord
  self.abstract_class = true
  self.table_name_prefix = 'ad_'

  def flatten_errors
    errors.messages.map { |attribute, messages| messages.map { |msg| "#{attribute}: #{msg}" } }.flatten.join("\n")
  end
end
