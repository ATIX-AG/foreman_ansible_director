# frozen_string_literal: true

class LifecycleEnvironmentPath < PulsibleModel
  scoped_search on: %i[name]

  belongs_to :organization, inverse_of: :lifecycle_environment_paths

  belongs_to :root_environment,
    class_name: 'LifecycleEnvironment',
    optional: true
  has_many :lifecycle_environments,
    dependent: :destroy

  validates :name, presence: true

  scope :by_name, ->(name) { where(name: name) }
  scope :with_root, -> { where.not(root_environment_id: nil) }

  def insert_at_position(lifecycle_environment, position)
    transaction do
      lifecycle_environment.lifecycle_environment_path = self

      old_lce = environment_at_position(position)

      case position
      when 0
        insert_at_beginning(lifecycle_environment)
      when -1
        if old_lce
          insert_at_end(lifecycle_environment)
        else
          insert_at_beginning(lifecycle_environment) # Empty path
        end
      else
        if old_lce
          lifecycle_environment.parent = old_lce.parent
          lifecycle_environment.position = position

          old_lce.update!(parent: lifecycle_environment)
          increment_position old_lce
        else
          insert_at_end(lifecycle_environment)
        end

      end

      lifecycle_environment.save!
    end
  end

  def promote(source_environment_id, target_environment_id)
    success = false

    transaction do
      source_env = lifecycle_environments.find_by(id: source_environment_id)
      target_env = lifecycle_environments.find_by(id: target_environment_id)

      unless source_env
        errors.add(:source_environment_id, 'Source environment not found')
        raise ActiveRecord::Rollback
      end

      unless target_env
        errors.add(:target_environment_id, 'Target environment not found')
        raise ActiveRecord::Rollback
      end

      valid_promotion?(source_env, target_env)

      if source_env.using_snapshot_content?
        source_env.content_snapshot.increment_references
        target_env.content_snapshot&.decrement_references
        target_env.update!(content_snapshot: source_env.content_snapshot)
      else
        snapshot = create_snapshot source_env
        target_env.content_snapshot&.decrement_references
        target_env.update!(content_snapshot: snapshot)
      end

      if (ee_id = source_env.execution_environment&.id)
        target_env.update!(execution_environment_id: ee_id)
      end

      success = true
    end
    success
  end

  def create_snapshot(environment)
    snapshot = ContentSnapshot.create!(references: 1, content_hash: environment.content_hash)
    content_unit_version_ids = environment.content_unit_versions.pluck(:id)
    content_unit_version_ids.each do |content_unit_version_id|
      ContentSnapshotContentUnitVersion.create!(
        {
          content_snapshot_id: snapshot.id,
          content_unit_version_id: content_unit_version_id,
        }
      )
    end
    snapshot
  end

  # TODO: If we ever use trees, this must not branch endlessly
  def increment_position(lifecycle_environment)
    if lifecycle_environment.children.empty?
      lifecycle_environment.update(position: lifecycle_environment.position + 1)
    else
      lifecycle_environment.children.each { |child| increment_position child }
    end
  end

  def insert_at_beginning(lifecycle_environment)
    lifecycle_environment.position = 0
    lifecycle_environment.parent = nil

    old_root = root_environment
    self.root_environment = lifecycle_environment

    old_root&.update!(parent: lifecycle_environment)

    save!
  end

  def insert_at_end(lifecycle_environment)
    lifecycle_environment.position = next_position

    current_leaf = lifecycle_environments.order('position').last
    lifecycle_environment.parent = current_leaf
  end

  # TODO: Unused. Does this bring advantages anywhere?
  def swap_environments(env1_id, env2_id)
    LifecycleEnvironment.transaction do
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

  def environment_at_position(position)
    return nil if position.nil?

    if position.negative?
      total_count = lifecycle_environments.count
      position = total_count + position
      return nil if position.negative?
    end

    lifecycle_environments.find_by(position: position)
  end

  def next_position
    max_position = lifecycle_environments.maximum(:position)
    max_position ? max_position + 1 : 0
  end

  def valid_promotion?(source_env, target_env)
    if source_env.leaf?
      errors.add(:source_env, 'Source environment is the final link in chain.')
      raise ActiveRecord::Rollback
    elsif source_env.position > target_env.position
      errors.add(:source_env,
        "Wrong promotion direction. Source environment position is greater than target
         environment position. (#{source_env.position} > #{target_env.position}).")
      raise ActiveRecord::Rollback
      # rubocop:disable Lint/LiteralAsCondition
    elsif target_env.position != (source_env.position + 1) && !false # TODO: Setting: Force incremental promotion
      # rubocop:enable Lint/LiteralAsCondition
      errors.add(:source_env, 'Promotion spans more than two environments and $SETTING_NAME is set to false.')
      raise ActiveRecord::Rollback
    end
  end
end
