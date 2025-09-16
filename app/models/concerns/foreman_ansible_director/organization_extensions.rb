# frozen_string_literal: true

module ForemanAnsibleDirector
  module OrganizationExtensions
    extend ActiveSupport::Concern

    included do
      has_many :execution_environments, class_name: 'ExecutionEnvironment', dependent: :destroy
      has_many :content_units, class_name: 'ContentUnit', dependent: :destroy
      has_many :lifecycle_environments, class_name: 'LifecycleEnvironment', dependent: :destroy
      has_many :lifecycle_environment_paths, class_name: 'LifecycleEnvironmentPath', dependent: :destroy
    end
  end
end
