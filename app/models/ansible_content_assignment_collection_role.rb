# frozen_string_literal: true

class AnsibleContentAssignmentCollectionRole < AnsibleDirectorModel

  belongs_to :ansible_content_assignment
  belongs_to :ansible_collection_role
end
