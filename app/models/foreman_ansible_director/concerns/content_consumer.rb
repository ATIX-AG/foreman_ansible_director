# frozen_string_literal: true

module ForemanAnsibleDirector
  module Concerns
    module ContentConsumer
      extend ActiveSupport::Concern

      included do
        has_many :ansible_content_assignments, as: :assignable, dependent: :destroy, class_name: '::ForemanAnsibleDirector::AnsibleContentAssignment'
      end
    end
  end
end
