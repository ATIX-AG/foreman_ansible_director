# frozen_string_literal: true

module ForemanAnsibleDirector
  class LifecycleEnvironmentPathService < AnsibleDirectorService
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
          # I am disabling the linter rule here, because in this case, I do not care about callbacks.
          # Associated lifecycle environments will be deleted anyway and update_all is faster than manual iteration.
          # rubocop:disable Rails/SkipsModelValidations
          path.lifecycle_environments.update_all(parent_id: nil, child_id: nil)
          # rubocop:enable Rails/SkipsModelValidations
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

          recipient_lces = valid_promotion?(source_env, target_env)

          source_snapshot = if source_env.using_snapshot_content?
                              source_env.content_snapshot.increment_references(recipient_lces.length)
                              source_env.content_snapshot
                            else
                              create_snapshot(source_env, initial_references: recipient_lces.length)
                            end
          source_ee_id = source_env.execution_environment&.id

          recipient_lces.each do |recipient_lce|
            recipient_lce.content_snapshot&.decrement_references
            recipient_lce.update!(content_snapshot: source_snapshot)
            recipient_lce.update!(execution_environment_id: source_ee_id) if source_ee_id
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
        if source_env.position > target_env.position
          ctx.add_error(::ForemanAnsibleDirector::Issues::Errors::UnsupportedRollbackError.new(
            source_environment: source_env,
            target_environment: target_env
          ), critical: true)

        elsif source_env.position == target_env.position
          ctx.add_error(::ForemanAnsibleDirector::Issues::Errors::PromotionSourceTargetIdenticalError.new(
            environment: target_env
          ), critical: true)

        elsif target_env.position - source_env.position == 1
          [target_env]

          # ((p_source + 1)..(p_target - 1)).to_a.length > 0
          # ((p_source + 1)..(p_target - 1)).length > 0 <=> (p_target - 1) - (p_source + 1) + 1 > 0
          # (p_target - 1) - (p_source + 1) + 1 > 0 <=> p_target - p_source > 1
          # Ex.: Promotion of 1 to 3, implicit promotion of 2
          # ((1 + 1)..(3-1)).length <=> [2].length = 1
          # Ex.: Promotion of 1 to 2, no implicit promotion
          # ((1 + 1)..(2-1)).length = 0, p_target - p_source = 1 !> 1, guard does not fire
        elsif target_env.position - source_env.position > 1
          if Setting[:ansible_director_lce_path_force_incremental]
            ctx.add_error(::ForemanAnsibleDirector::Issues::Errors::IllegalImplicitPromotionError.new(
              source_environment: source_env,
              target_environment: target_env
            ), critical: true)
          else
            target_env.lifecycle_environment_path.lifecycle_environments.where(position: (
              (source_env.position + 1)..(target_env.position - 1)
            ).to_a) + [target_env]
          end
        end
      end

      def create_snapshot(environment, initial_references: 1)
        snapshot = ::ForemanAnsibleDirector::ContentSnapshot.create!(references: initial_references,
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
