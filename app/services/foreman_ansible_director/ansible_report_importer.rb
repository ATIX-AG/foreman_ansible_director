# frozen_string_literal: true

module ForemanAnsibleDirector
  module AnsibleReportImporter
    extend ActiveSupport::Concern
    included do
      def host
        Rails.logger.debug raw
      end
    end
  end
end
