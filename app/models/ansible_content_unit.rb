# frozen_string_literal: true

class AnsibleContentUnit < PulsibleModel
  self.abstract_class = true

  scope :all_content_units, lambda {
                              descendants.reduce(AnsibleContentUnit.none) { |scope, subclass| scope.or(subclass.all) }
                            }

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
