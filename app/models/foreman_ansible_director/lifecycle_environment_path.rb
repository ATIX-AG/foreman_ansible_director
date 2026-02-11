# frozen_string_literal: true

module ForemanAnsibleDirector
  class LifecycleEnvironmentPath < ::ForemanAnsibleDirector::AnsibleDirectorModel
    belongs_to :organization, inverse_of: :lifecycle_environment_paths

    belongs_to :root_environment,
      class_name: 'LifecycleEnvironment',
      optional: true
    has_many :lifecycle_environments,
      dependent: :destroy

    validates :name, presence: true

    scope :by_name, ->(name) { where(name: name) }
    scope :with_root, -> { where.not(root_environment_id: nil) }

    scoped_search on: :name, complete_value: true

    def environments_ordered
      lifecycle_environments.order('position')
    end
  end
end
