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

    # TODO: Unused. Does this bring advantages anywhere?
    def swap_environments(env1_id, env2_id)
      ::ForemanAnsibleDirector::LifecycleEnvironment.transaction do
        env1 = lifecycle_environments.find(env1_id)
        env2 = lifecycle_environments.find(env2_id)

        temp_position = env1.position
        env1.update!(position: env2.position)
        env2.update!(position: temp_position)

        temp_parent = env1.parent
        env1.update!(parent: env2.parent)
        env2.update!(parent: temp_parent)

        env1.children.each { |child| child.update!(parent: env2) }
        env2.children.each { |child| child.update!(parent: env1) }

        new_root = lifecycle_environments.includes(:parent).find { |env| env.parent.nil? }
        update!(root_environment: new_root) if new_root
      end
    end

    def environments_ordered
      lifecycle_environments.order('position')
    end
  end
end
