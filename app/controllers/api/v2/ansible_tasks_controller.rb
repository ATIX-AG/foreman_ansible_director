# frozen_string_literal: true

require 'securerandom'

module Api
  module V2
    class AnsibleTasksController < AnsibleDirectorApiController

      before_action :find_resource, only: [ :show ]

      def index
        @ansible_tasks = resource_scope_for_index
      end

      def show
        execution_plan = @ansible_task.execution_plan
        @state = execution_plan.state
        @steps = execution_plan.steps.select { |key, value| value.is_a? Dynflow::ExecutionPlan::Steps::RunStep }.values
        @step_outputs = @steps.map { |step|
          ForemanTasks.dynflow.world.persistence.load_action(step).output
        }
        a = 2
      end

      def resource_scope
        ForemanTasks::Task.where("label like 'Ansible - %'")
      end

    end
  end
end