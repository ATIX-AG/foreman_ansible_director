# frozen_string_literal: true

module ForemanAnsibleDirector
  module Logging
    module LoggableModel
      extend ActiveSupport::Concern

      include ::ForemanAnsibleDirector::RequestCtx::RequestContextHelper

      included do
        after_create :log_creation
        after_update :log_update
        after_destroy :log_destroy
      end

      def loggable?
        true
      end

      def log_creation
        ctx&.add_created(self) if loggable?
      end

      def log_update
        ctx&.add_updated(self) if !previous_changes.empty? && loggable?
      end

      def log_destroy
        ctx&.add_deleted(self) if loggable?
      end
    end
  end
end
