# frozen_string_literal: true

module ForemanAnsibleDirector
  module Actions
    module Rescue
      module AnsibleContentUnit
        module Common
          class CleanupCheck < ::ForemanAnsibleDirector::Actions::Base::AnsibleDirectorAction
            input_format do
              param :repository_create_action, Hash
              param :distribution_create_action, Hash
              param :remote_create_action, Hash
            end

            def run
              repository_create_action = input[:repository_create_action]
              distribution_create_action = input[:distribution_create_action]
              remote_create_action = input[:remote_create_action]

              repository_success = repository_create_action[:success]
              distribution_success = distribution_create_action[:success]
              collection_remote_success = remote_create_action[:success]

              all_successful = repository_success && distribution_success && collection_remote_success

              output.update(skip_repository_cleanup: all_successful || !repository_success,
                skip_distribution_cleanup: all_successful || !distribution_success,
                skip_remote_cleanup: all_successful || !collection_remote_success)
            end
          end
        end
      end
    end
  end
end
