# frozen_string_literal: true

module ForemanAnsibleDirector
  class ContentUnitRevision < ::ForemanAnsibleDirector::AnsibleDirectorModel


    belongs_to :content_unit_version

  end
end
