# frozen_string_literal: true

module ForemanAnsibleDirector
  module Concerns
    module HostgroupExtensions
      extend ActiveSupport::Concern
      included do
        include ::ForemanAnsibleDirector::Concerns::ContentConsumer

        # Not very pretty, but since Katello already extends this class by "lifecycle_environment",
        # this association needs to be named something else.
        belongs_to :ansible_lifecycle_environment,
          class_name: '::ForemanAnsibleDirector::LifecycleEnvironment',
          inverse_of: :hostgroups,
          optional: true
      end
    end
  end
end
