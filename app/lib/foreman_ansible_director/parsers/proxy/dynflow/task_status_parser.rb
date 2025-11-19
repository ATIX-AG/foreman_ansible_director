# frozen_string_literal: true

module ForemanAnsibleDirector
  module Parsers
    module Proxy
      module Dynflow
        class TaskStatusParser < DynflowResponse
          SCHEDULED = 'scheduled'
          STOPPED = 'stopped'
          PAUSED = 'paused'

          PENDING = 'pending'
          SUCCESS = 'success'
          ERROR = 'error'

          FINISHED_STATES = [STOPPED].freeze
          SUCCESS_STATES = [SUCCESS].freeze

          def task_completed?
            FINISHED_STATES.include? @parsed_response['state']
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
