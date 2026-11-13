# frozen_string_literal: true

module ForemanAnsibleDirector
  module Concerns
    module Foreman
      module Controller
        module HostgroupExtensions
          extend ActiveSupport::Concern

          # Rubocop does not know that these actions actually exist and issues a warning
          # rubocop:disable Rails/LexicallyScopedActionFilter
          included do
            prepend_before_action :filter_parameters, only: %i[create]
            after_action :ad_create_assignments, only: %i[create]
          end
          # rubocop:enable Rails/LexicallyScopedActionFilter

          def ad_create_assignments
            return if !@hostgroup.persisted? || @ansible_director_assignment_data.nil?
            assignment_params = JSON.parse(@ansible_director_assignment_data).map(&:symbolize_keys)
            ::ForemanAnsibleDirector::AssignmentService.create_bulk_assignments(
              target: @hostgroup,
              assignments: assignment_params
            )
          end

          def filter_parameters
            @ansible_director_assignment_data = params[:hostgroup].delete(:ansible_director_assignment_data)
          end

          module ApiDoc
            extend Apipie::DSL::Concern

            update_api(:create, :update) do
              param :hostgroup, Hash do
                param :ansible_lifecycle_environment_id,
                  :number,
                  desc: N_('Ansible lifecycle environment identifier.'),
                  required: false
                param :ansible_lifecycle_environment_state,
                  %w[none inherit],
                  desc: N_('Control parameter to specify how to interpret "ansible_lifecycle_environment_id == null".'),
                  required: false
              end
            end
          end
        end
      end
    end
  end
end
