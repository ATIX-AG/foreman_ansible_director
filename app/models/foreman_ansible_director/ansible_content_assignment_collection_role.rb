# frozen_string_literal: true

module ForemanAnsibleDirector
  class AnsibleContentAssignmentCollectionRole < ::ForemanAnsibleDirector::AnsibleDirectorModel
    belongs_to :ansible_content_assignment
    belongs_to :ansible_collection_role
  end
  # TODO: Delete class - assignments are handled via generic assignment model
end
