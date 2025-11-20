# frozen_string_literal: true

class ContentUnit < AnsibleDirectorModel
  scoped_search on: %i[name namespace]

  belongs_to :organization, inverse_of: :content_units

  has_many :execution_environment_content_units, dependent: :destroy
  has_many :execution_environments, through: :execution_environment_content_units
  has_many :content_unit_versions, as: :versionable, dependent: :destroy

  validates :name, presence: true
  validates :type, presence: true

  def collection?
    type == 'AnsibleCollection'
  end

  def role?
    type == 'AnsibleRole'
  end

  def full_name
    "#{namespace}.#{name}"
  end

  def self.polymorphic_name
    name
  end

  after_create :fix_version_types

  private

  def fix_version_types
    content_unit_versions.each do |version|
      version.update(versionable_type: self.class.name)
    end
  end
end
