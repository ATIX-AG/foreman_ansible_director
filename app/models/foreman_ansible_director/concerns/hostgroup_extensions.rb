# frozen_string_literal: true

module ForemanAnsibleDirector
  module HostgroupExtensions
    extend ActiveSupport::Concern
    included do
      include ForemanAnsibleDirector::ContentConsumer
      belongs_to :lifecycle_environment, optional: true
    end
  end
end
