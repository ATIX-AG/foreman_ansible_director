module ForemanAnsibleDirector
  module AnsibleReportImporter
    extend ActiveSupport::Concern
    included do
      def host
        puts raw
      end
    end
  end
end