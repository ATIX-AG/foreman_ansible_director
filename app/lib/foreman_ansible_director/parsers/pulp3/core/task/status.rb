# frozen_string_literal: true

module ForemanAnsibleDirector
  module Parsers
    module Pulp3
      module Core
        module Task
          class Status < ::ForemanAnsibleDirector::Parsers::Pulp3::ApiResponse
            WAITING = 'waiting'
            SKIPPED = 'skipped'
            RUNNING = 'running'
            COMPLETED = 'completed'
            FAILED = 'failed'
            CANCELED = 'canceled'
            FINISHED_STATES = [COMPLETED, FAILED, CANCELED, SKIPPED].freeze

            def task_completed?
              FINISHED_STATES.include? @raw_response['state']
            end

            def progress
              return 1 if task_completed?
              0
            end
          end
        end
      end
    end
  end
end
