# frozen_string_literal: true

module ForemanAnsibleDirector
  module Concerns
    module OrganizationExtensions
      extend ActiveSupport::Concern

      included do
        has_many :execution_environments, class_name: '::ForemanAnsibleDirector::ExecutionEnvironment',
dependent: :destroy
        has_many :content_units, class_name: '::ForemanAnsibleDirector::ContentUnit', dependent: :destroy
        has_many :lifecycle_environments, class_name: '::ForemanAnsibleDirector::LifecycleEnvironment',
dependent: :destroy
        has_many :lifecycle_environment_paths, class_name: '::ForemanAnsibleDirector::LifecycleEnvironmentPath',
dependent: :destroy
        has_many :ansible_variables, class_name: '::ForemanAnsibleDirector::AnsibleVariable',
                 dependent: :destroy
        has_many :ansible_variable_bindings, class_name: '::ForemanAnsibleDirector::AnsibleVariableBinding',
                 dependent: :destroy
      end
    end
  end
end
