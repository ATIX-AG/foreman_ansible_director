# frozen_string_literal: true

module ForemanAnsibleDirector
  module Concerns
    module HostgroupExtensions
      extend ActiveSupport::Concern
      include ::ForemanAnsibleDirector::Abstract::ContentResolutionNode
      included do
        include ::ForemanAnsibleDirector::Concerns::ContentConsumer

        # Not very pretty, but since Katello already extends this class by "lifecycle_environment",
        # this association needs to be named something else.
        belongs_to :ansible_lifecycle_environment,
          class_name: '::ForemanAnsibleDirector::LifecycleEnvironment',
          inverse_of: :hostgroups,
          optional: true
      end

      def cr_immediate_predecessor
        parent
      end

      def cr_name
        name
      end

      def cr_content_assignments
        ansible_content_assignments
      end

      def cr_content_source
        ansible_lifecycle_environment
      end

      def cr_content_source_state
        ansible_lifecycle_environment_state
      end
    end
  end
end
