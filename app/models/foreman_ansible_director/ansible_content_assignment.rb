# frozen_string_literal: true

module ForemanAnsibleDirector
  class AnsibleContentAssignment < ::ForemanAnsibleDirector::AnsibleDirectorModel
    belongs_to :consumable, polymorphic: true
  end
end
