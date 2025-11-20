# frozen_string_literal: true

module ForemanAnsibleDirector
  module HostExtensions
    extend ActiveSupport::Concern
    included do
      include ForemanAnsibleDirector::ContentConsumer
      belongs_to :lifecycle_environment, optional: true, foreign_key: :ansible_lifecycle_environment_id
    end

    # def ansible_lifecycle_environment_id
    #  lifecycle_environment&.id
    # end

    def resolved_ansible_content
      content = []
      additions = ansible_content_assignments.where(subtractive: false)
      if hostgroup
        hostgroup_content = hostgroup.ansible_content_assignments
        subtractions = ansible_content_assignments.where(subtractive: true).map {|assignment| assignment.consumable.id}
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
  end
end
