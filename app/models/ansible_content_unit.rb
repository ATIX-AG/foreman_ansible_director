# frozen_string_literal: true

class AnsibleContentUnit < PulsibleModel
  self.abstract_class = true

  def self.find_any(attributes)
    descendants.each do |subclass|
      result = subclass.find_by(attributes)
      return result if result
    end
    nil
  end

  def collection?
    is_a? AnsibleCollection
  end

  def role?
    is_a? AnsibleRole
  end
end
