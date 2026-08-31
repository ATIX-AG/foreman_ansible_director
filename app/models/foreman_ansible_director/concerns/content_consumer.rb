# frozen_string_literal: true

module ForemanAnsibleDirector
  module Concerns
    module ContentConsumer
      extend ActiveSupport::Concern

      included do
        has_many :ansible_content_assignments, as: :consumable, dependent: :destroy,
                 class_name: '::ForemanAnsibleDirector::AnsibleContentAssignment'
        has_many :ansible_variable_bindings, as: :consumable, dependent: :destroy,
                 class_name: '::ForemanAnsibleDirector::AnsibleVariableBinding'
      end
    end
  end
end
