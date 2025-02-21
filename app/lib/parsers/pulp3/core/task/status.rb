module Parsers
  module Pulp3
    module Core
      module Task
        class Status < ::Parsers::Pulp3::ApiResponse

          WAITING = 'waiting'.freeze
          SKIPPED = 'skipped'.freeze
          RUNNING = 'running'.freeze
          COMPLETED = 'completed'.freeze
          FAILED = 'failed'.freeze
          CANCELED = 'canceled'.freeze
          FINISHED_STATES = [COMPLETED, FAILED, CANCELED, SKIPPED].freeze

          def task_completed?
            FINISHED_STATES.include? @raw_response.dig('state')
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