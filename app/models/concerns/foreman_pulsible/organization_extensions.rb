# frozen_string_literal: true

module ForemanPulsible
  module OrganizationExtensions
    extend ActiveSupport::Concern

    included do
      has_many :execution_environments, class_name: 'ExecutionEnvironment', dependent: :destroy
      has_many :ansible_content_units, class_name: 'AnsibleContentUnit', dependent: :destroy
    end
  end
end
