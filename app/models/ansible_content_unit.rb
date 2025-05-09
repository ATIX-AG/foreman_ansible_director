# frozen_string_literal: true

class AnsibleContentUnit < PulsibleModel
  self.abstract_class = true

  has_many :execution_environment_content_versions
  has_many :execution_environments, through: :execution_environment_content_versions
  def versions
    AnsibleContentVersion.where(versionable_id: id)
  end

  scoped_search on: %i[name namespace]

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

  def unit_type
    if collection?
      'collection'
    elsif role?
      'role'
    end
  end
end
