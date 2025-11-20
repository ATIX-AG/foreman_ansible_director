# frozen_string_literal: true

module ForemanAnsibleDirector
  class AnsibleContentAssignment < ::ForemanAnsibleDirector::AnsibleDirectorModel
    belongs_to :consumable, polymorphic: true
    belongs_to :assignable, polymorphic: true

    def content_unit_version
      case consumable
      when ::ForemanAnsibleDirector::AnsibleCollectionRole
        consumable.ansible_collection_version # TODO: IMPORTANT! ACV should be referenced as content unit version!
      when ::ForemanAnsibleDirector::AnsibleRole
        consumable.content_unit_version
      end
    end
  end
end
