# frozen_string_literal: true

module ForemanAnsibleDirector
  module Concerns
    module HostgroupExtensions
      extend ActiveSupport::Concern
      included do
        include ::ForemanAnsibleDirector::Concerns::ContentConsumer
        belongs_to :lifecycle_environment, optional: true
      end
    end
  end
end
