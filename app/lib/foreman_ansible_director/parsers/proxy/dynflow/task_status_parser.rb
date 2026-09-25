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

          def success?
            SUCCESS_STATES.include? @parsed_response['result']
          end

          def progress
            return 1 if task_completed?
            0
          end

          def external_output
            # The triggered action is BuildPushEe, which uses MetaRunner to keep track of different stages
            # There is guaranteed to be exactly a single item in the 'actions' array.
            build_action = @parsed_response['actions'][0]
            build_action['output']
          end
        end
      end
    end
  end
end
