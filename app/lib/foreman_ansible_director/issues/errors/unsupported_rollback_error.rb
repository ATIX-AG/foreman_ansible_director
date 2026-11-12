# frozen_string_literal: true

module ForemanAnsibleDirector
  module Issues
    module Errors
      class UnsupportedRollbackError < BaseError
        def initialize(source_environment:,
                       target_environment:)
          @source_environment = source_environment
          @target_environment = target_environment
          super
        end

        def status_code
          422
        end

        def title
          _('Unsupported rollback')
        end

        def message
          path = @source_environment.lifecycle_environment_path

          source_render_name = "#{path.name} > #{@source_environment.name}"
          target_render_name = "#{path.name} > #{@target_environment.name}"

          <<~MESSAGE
            Promotion of Ansible content
            from Ansible lifecycle environment: #{source_render_name}
            to Ansible lifecycle environment: #{target_render_name}
            constitutes a rollback because the position of #{source_render_name} (#{@source_environment.position})
            is higher in the path #{path.name} than the position of #{target_render_name} (#{@target_environment.position}).
            Foreman does not support rolling back of Ansible lifecycle environment states.
          MESSAGE
        end
      end
    end
  end
end
