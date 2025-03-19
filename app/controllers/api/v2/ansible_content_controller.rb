# frozen_string_literal: true

module Api
  module V2
    class AnsibleContentController < ::Api::V2::BaseController
      include ::Api::Version2
      # TODO: APIDOC

      def create_units
        resolved = ::AnsibleContent::AnsibleContentHelpers.resolve_import_payload params[:units]
        @bulk_create_task = ForemanTasks.sync_task(::Actions::ForemanPulsible::AnsibleContentUnit::Bulk::Import,
          resolved_content_units: resolved)
      end

      def index_units
        @ansible_content_units = AnsibleContentUnit.all_content_units.paginate(page: 1, per_page: 25)
      end

      def destroy_units
        resolved = ::AnsibleContent::AnsibleContentHelpers.resolve_destroy_payload params[:units]
        @bulk_destroy_task = ForemanTasks.sync_task(::Actions::ForemanPulsible::AnsibleContentUnit::Bulk::Destroy,
          resolved_content_units: resolved)
      end

      private

      def validate_requirements_payload
        # TODO: Grammar
        params.require(:requirements_file)
      end
    end
  end
end
