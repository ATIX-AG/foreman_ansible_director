# frozen_string_literal: true

class AnsibleRole < ContentUnit
  has_many :ansible_variables, dependent: :destroy
  has_many :content_unit_versions, as: :versionable, dependent: :destroy

  validates :name, presence: true
  validates :namespace, presence: true
end
