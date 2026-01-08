# frozen_string_literal: true

module ForemanAnsibleDirector
  class ActiveRevision < AnsibleDirectorModel
    belongs_to :content_unit_revision
    belongs_to :consumable, polymorphic: true
  end
end
