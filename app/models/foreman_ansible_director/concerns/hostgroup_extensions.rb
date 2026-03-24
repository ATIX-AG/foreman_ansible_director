# frozen_string_literal: true

module ForemanAnsibleDirector
  module Concerns
    module HostgroupExtensions
      extend ActiveSupport::Concern
      included do
        include ::ForemanAnsibleDirector::Concerns::ContentConsumer
      end
    end
  end
end
