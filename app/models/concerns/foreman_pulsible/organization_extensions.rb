# frozen_string_literal: true

module ForemanPulsible
  module OrganizationExtensions
    extend ActiveSupport::Concern

    included do
      has_many :execution_environments, class_name: 'ExecutionEnvironment', dependent: :destroy
      has_many :ansible_roles, class_name: 'AnsibleRole', dependent: :destroy
      has_many :ansible_collections, class_name: 'AnsibleCollection', dependent: :destroy
    end
  end
end
