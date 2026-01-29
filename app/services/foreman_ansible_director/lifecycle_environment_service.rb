# frozen_string_literal: true

module ForemanAnsibleDirector
  class LifecycleEnvironmentService
    class << self
      def create_environment(lce_path:,
                             name:,
                             description:,
                             position:,
                             organization_id:)
        created_env = nil
        ActiveRecord::Base.transaction do
          created_env = ::ForemanAnsibleDirector::LifecycleEnvironment.new(
            name: name,
            description: description,
            organization_id: organization_id
          )
          ::ForemanAnsibleDirector::LifecycleEnvironmentPathService.insert_environment(
            lce_path,
            created_env,
            position
          )
        end
        created_env
      end

      def edit_environment(environment:,
                           name:,
                           description:,
                           execution_environment_id:)
        ActiveRecord::Base.transaction do
          environment.update!(
            name: name,
            description: description,
            execution_environment_id: execution_environment_id
          )
        end
      end

      def destroy_environment(environment)
        ActiveRecord::Base.transaction do
          path = environment.lifecycle_environment_path

          if environment.parent
            environment.child.update!(
              parent_id: environment.parent.id
            )
          else # env is root environment in path
            path.update!(
              root_environment_id: environment.child&.try(:id) || nil
            )
          end

          environment.destroy!
        end
      end

      def assign(environment, target)
        ActiveRecord::Base.transaction do
          target.update!(ansible_lifecycle_environment_id: environment.id)
        end
      end

      # TODO: TEST
      def assign_library(target)
        ActiveRecord::Base.transaction do
          target.update!(ansible_lifecycle_environment_id: nil)
        end
      end

      def assign_content(environment, content_assignments, execution_environment_id)
        ActiveRecord::Base.transaction do
          success = false
          environment.direct_content_unit_versions.clear
          content_assignments.each do |assignment|
            unit = ::ForemanAnsibleDirector::ContentUnit.find(assignment[:id])
            unit_version = unit.content_unit_versions.find_by!(version: assignment[:version])
            success &&= environment.assign_content_unit_version!(unit_version)
          end
          success &&= environment.assign_execution_environment!(execution_environment_id) if execution_environment_id

          raise ActiveRecord::Rollback unless success
        end
      end

      def increment_position(environment)
        environment.update(position: environment.position + 1)
        increment_position(environment.child) unless environment.leaf?
      end

      def decrement_position(environment)
        environment.update(position: environment.position - 1)
        decrement_position(environment.child) unless environment.leaf?
      end
    end
  end
end
