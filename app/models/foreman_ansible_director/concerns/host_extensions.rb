# frozen_string_literal: true

module ForemanAnsibleDirector
  module Concerns
    module HostExtensions
      extend ActiveSupport::Concern
      include ::ForemanAnsibleDirector::Abstract::ContentResolutionNode

      included do
        include ::ForemanAnsibleDirector::Concerns::ContentConsumer

        belongs_to :ansible_lifecycle_environment,
          class_name: '::ForemanAnsibleDirector::LifecycleEnvironment',
          inverse_of: :hosts,
          optional: true
      end

      def resolved_ansible_content
        content = []
        additions = ansible_content_assignments.where(subtractive: false)
        if hostgroup
          hostgroup_content = hostgroup.ansible_content_assignments
          subtractions = ansible_content_assignments.where(subtractive: true).map do |assignment|
            assignment.consumable.id
          end
          if subtractions.empty?
            hostgroup_content.each do |content_assignment|
              content << content_assignment unless subtractions.include? content_assignment.consumable.id
            end
          else
            content.concat hostgroup_content
          end
        end
        content.concat additions
      end

      def cr_immediate_predecessor
        hostgroup
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
