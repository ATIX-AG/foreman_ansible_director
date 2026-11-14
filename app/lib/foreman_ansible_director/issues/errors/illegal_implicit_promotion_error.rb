# frozen_string_literal: true

module ForemanAnsibleDirector
  module Issues
    module Errors
      class IllegalImplicitPromotionError < BaseError
        def initialize(source_environment:,
                       target_environment:)
          @source_environment = source_environment
          @target_environment = target_environment
          super
        end

        def title
          _('Illegal implicit promotion')
        end

        def message
          path = @source_environment.lifecycle_environment_path

          source_render_name = "#{path.name} > #{@source_environment.name}"
          target_render_name = "#{path.name} > #{@target_environment.name}"

          implicit_envs = path.lifecycle_environments.where(position: (
              (@source_environment.position + 1)..(@target_environment.position - 1)
            ).to_a)

          <<~MESSAGE
            Promotion of Ansible content
            from Ansible lifecycle environment: #{source_render_name}
            to Ansible lifecycle environment: #{target_render_name}
            implicitly promotes Ansible content of #{source_render_name} to the following Ansible lifecycle environments:
            ---
            #{implicit_envs.map do |env|
              <<~LCE
                - LCE #{path.name} > #{env.name} (ID: #{env.id})
              LCE
            end.join("\n")
            }
            ---
            Promote content incrementally or set the "ansible_director_lce_path_force_incremental" setting to false
            and re-send the request.
          MESSAGE
        end

        def status_code
          422
        end
      end
    end
  end
end
