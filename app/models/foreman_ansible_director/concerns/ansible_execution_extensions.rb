# frozen_string_literal: true

module ForemanAnsibleDirector
  module Concerns
    module AnsibleExecutionExtensions
      extend ActiveSupport::Concern

      prepended do
        after_build :invoke_ansible_configuration_job
      end

      def invoke_ansible_configuration_job
        return unless ::Foreman::Cast.to_bool(host_param('ansible_director_configure_after_provisioning'))

        content_source, = ::ForemanAnsibleDirector::AssignmentService.content_source_for self
        unless content_source
          logger.warn "ANSIBLE: Configuration job NOT planned! Host #{name} does not belong to an Ansible environment."
          return
        end

        execution_environment = content_source.cs_execution_environment

        execution_environment ||= ::ForemanAnsibleDirector::ExecutionEnvironment.find_by(
          id: Setting[:ansible_director_default_ee_internal]
        )

        unless execution_environment
          logger.warn(
            <<~MSG
              ANSIBLE: Configuration job NOT planned! No Execution Environment is associated with host #{name}.
              Assign an Execution Environment to #{content_source.cs_name} or set the
              "ansible_director_default_ee_internal" setting.
            MSG
          )
          return
        end

        composer = JobInvocationComposer.for_feature('ansible_director_configure_host', self)

        start_time = Time.zone.now + host_param('ansible_director_configuration_delay').to_i.seconds
        composer.triggering.mode = :future
        composer.triggering.start_at = (
          start_time
        )
        composer.trigger!
        logger.info "ANSIBLE: Configuration job planned successfully! Host #{name} will be configured at #{start_time}."
      rescue StandardError => e
        logger.error(
          <<~MSG
            ANSIBLE: An error occurred trying to plan the configuration job for host #{name}!
            Message: #{e.message}
          MSG
        )
      end
    end
  end
end
