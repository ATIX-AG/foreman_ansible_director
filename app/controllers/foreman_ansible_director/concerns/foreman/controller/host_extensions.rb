# frozen_string_literal: true

module ForemanAnsibleDirector
  module Concerns
    module Foreman
      module Controller
        module HostExtensions
          extend ActiveSupport::Concern

          # Rubocop does not know that these actions actually exist and issues a warning
          # rubocop:disable Rails/LexicallyScopedActionFilter
          included do
            prepend_before_action :filter_parameters
            after_action :ad_create_assignments, only: %i[create]
          end
          # rubocop:enable Rails/LexicallyScopedActionFilter

          def ad_create_assignments
            return if !@host.persisted? || @ansible_director_assignment_data.nil?
            assignment_params = JSON.parse(@ansible_director_assignment_data).map(&:symbolize_keys)
            ::ForemanAnsibleDirector::AssignmentService.create_bulk_assignments(
              target: @host,
              assignments: assignment_params
            )
          end

          def filter_parameters
            @ansible_director_assignment_data = params[:host]&.delete(:ansible_director_assignment_data)
          end
        end
      end
    end
  end
end
