# frozen_string_literal: true

module ForemanAnsibleDirector
  module HostgroupExtensions
    extend ActiveSupport::Concern
    included do
      include ForemanAnsibleDirector::ContentConsumer
    end
  end
end
