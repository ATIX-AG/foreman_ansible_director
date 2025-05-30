# frozen_string_literal: true

module Api
  module V2
    class AnsibleContentController < PulsibleApiController
      before_action :find_organization, only: %i[create_units destroy_units]
      before_action :find_optional_organization, only: %i[index]

      # TODO: APIDOC

      def create_units
        resolved = ::AnsibleContent::AnsibleContentHelpers.resolve_import_payload params[:units]
        @bulk_create_task = ForemanTasks.sync_task(::Actions::ForemanPulsible::AnsibleContentUnit::Bulk::Import,
          resolved_content_units: resolved,
          organization_id: @organization.id)
      end

      def index
        scope = resource_scope_for_index
        @ansible_content_units = if @organization
                                   scope.where(organization_id: @organization.id)
                                 else
                                   scope
                                 end
      end

      # TODO: This needs to check and invalidate built EEs
      def destroy_units
        resolved = ::AnsibleContent::AnsibleContentHelpers.resolve_destroy_payload params[:units]
        @bulk_destroy_task = ForemanTasks.sync_task(::Actions::ForemanPulsible::AnsibleContentUnit::Bulk::Destroy,
          resolved_content_units: resolved, organization_id: @organization.id)
      end

      private

      def validate_requirements_payload
        # TODO: Grammar
        params.require(:requirements_file)
      end

      def resource_scope
        AnsibleContentUnit.all_content_units
      end

      def index_relation
        units = AnsibleContentUnit
        units.where organization_id: (params[:organization_id] || @organization.id)
      end
    end
  end
end
