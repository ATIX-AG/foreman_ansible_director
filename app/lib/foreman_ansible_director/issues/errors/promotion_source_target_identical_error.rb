# frozen_string_literal: true

module ForemanAnsibleDirector
  module Issues
    module Errors
      class PromotionSourceTargetIdenticalError < BaseError
        def initialize(environment:)
          @environment = environment
          super
        end

        def status_code
          422
        end

        def title
          _('Source and target identical')
        end

        def message
          path = @environment.lifecycle_environment_path

          env_render_name = "#{path.name} > #{@environment.name}"

          <<~MESSAGE
            You cannot supply #{env_render_name} as both the source and target.
            Ensure that the supplied target Ansible lifecycle environment is higher than the source Ansible lifecycle environment.
          MESSAGE
        end
      end
    end
  end
end
