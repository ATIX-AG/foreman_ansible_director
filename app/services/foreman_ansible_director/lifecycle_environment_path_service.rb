# frozen_string_literal: true

module ForemanAnsibleDirector
  class LifecycleEnvironmentPathService < ::ForemanAnsibleDirector::AnsibleDirectorService
    class << self
      def create_path(name:,
                      description:,
                      organization_id:)
        ActiveRecord::Base.transaction do
          ::ForemanAnsibleDirector::LifecycleEnvironmentPath.create!(
            name: name,
            description: description,
            organization_id: organization_id
          )
        end
      end

      def edit_path(lce_path:,
                    name:,
                    description:)
        ActiveRecord::Base.transaction do
          lce_path.update!(
            name: name,
            description: description
          )
        end
      end

      def destroy_path(path)
        ActiveRecord::Base.transaction do # TODO: Rollback if any LCE is used by host; Setting
          # raise ActiveRecord::Rollback if path.lifecycle_environments.any? { |lce| lce.hosts.positive? }
          path.update!(root_environment_id: nil)
          path.destroy!
        end
      end

      def insert_environment(path, environment, position)
        ActiveRecord::Base.transaction do
          environment.lifecycle_environment_path = path

          old_lce = environment_at_position(path, position)

          case position
          when 0
            insert_at_beginning(path, environment)
          when -1
            if old_lce
              insert_at_end(path, environment)
            else
              insert_at_beginning(path, environment) # Empty path
            end
          else
            if old_lce
              environment.parent = old_lce.parent
              environment.child = old_lce

              old_lce.parent.update(child: environment)
              old_lce.parent = environment

              environment.position = position

              ::ForemanAnsibleDirector::LifecycleEnvironmentService.increment_position old_lce
            else
              insert_at_end(path, environment)
            end

          end

          environment.save!
        end
      end

      def promote(lce_path:,
                  source_environment_id:,
                  target_environment_id:)
        success = false

        ActiveRecord::Base.transaction do
          source_env = lce_path.lifecycle_environments.find_by(id: source_environment_id)
          target_env = lce_path.lifecycle_environments.find_by(id: target_environment_id)

          unless source_env
            # errors.add(:source_environment_id, 'Source environment not found')
            raise ActiveRecord::Rollback
          end

          unless target_env
            # errors.add(:target_environment_id, 'Target environment not found')
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

      private

      def environment_at_position(path, position)
        return nil if position.nil?

        if position.negative?
          total_count = path.lifecycle_environments.count
          position = total_count + position
          return nil if position.negative?
        end

        path.lifecycle_environments.find_by(position: position)
      end

      def insert_at_beginning(path, lifecycle_environment)
        lifecycle_environment.position = 0
        lifecycle_environment.parent = nil

        old_root = path.root_environment
        path.root_environment = lifecycle_environment

        old_root&.update!(parent: lifecycle_environment)
        lifecycle_environment.update!(child: old_root)
        path.save!
      end

      def insert_at_end(path, lifecycle_environment)
        lifecycle_environment.position = next_position(path)

        current_leaf = path.lifecycle_environments.order('position').last
        lifecycle_environment.parent = current_leaf
        current_leaf&.update!(child: lifecycle_environment)
      end

      def next_position(path)
        max_position = path.lifecycle_environments.maximum(:position)
        max_position ? max_position + 1 : 0
      end

      def valid_promotion?(source_env, target_env)
        # Disabling linter rule for this because this will be needed once explicit error handling is implemented
        # rubocop:disable Style/GuardClause
        if source_env.leaf?
          # errors.add(:source_env, 'Source environment is the final link in chain.')
          raise ActiveRecord::Rollback
        elsif source_env.position > target_env.position
          # errors.add(:source_env,
          #           "Wrong promotion direction. Source environment position is greater than target
          # environment position. (#{source_env.position} > #{target_env.position}).")
          raise ActiveRecord::Rollback
          # rubocop:disable Lint/LiteralAsCondition
        elsif target_env.position != (source_env.position + 1) && !false # TODO: Setting: Force incremental promotion
          # rubocop:enable Lint/LiteralAsCondition
          # errors.add(:source_env, 'Promotion spans more than two environments and $SETTING_NAME is set to false.')
          raise ActiveRecord::Rollback
        end
        # rubocop:enable Style/GuardClause
      end

      def create_snapshot(environment)
        snapshot = ::ForemanAnsibleDirector::ContentSnapshot.create!(references: 1,
          content_hash: environment.content_hash)
        content_unit_version_ids = environment.content_unit_versions.pluck(:id)
        content_unit_version_ids.each do |content_unit_version_id|
          ::ForemanAnsibleDirector::ContentSnapshotContentUnitVersion.create!(
            {
              content_snapshot_id: snapshot.id,
              content_unit_version_id: content_unit_version_id,
            }
          )
        end
        snapshot
      end
    end
  end
end
