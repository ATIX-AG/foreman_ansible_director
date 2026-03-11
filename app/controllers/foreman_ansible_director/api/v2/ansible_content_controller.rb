# frozen_string_literal: true

module ForemanAnsibleDirector
  module Api
    module V2
      class AnsibleContentController < AnsibleDirectorApiController
        before_action :find_organization, only: %i[create_units destroy_units]
        before_action :find_optional_organization, only: %i[index]

        resource_description do
          resource_id 'ansible_content'
          api_version 'v2'
          api_base_url '/ansible_director'
          param :organization_id, Integer, show: false
        end

        api :POST, '/ansible_content/', N_('Import ansible content units')
        param :organization_id, Integer, required: true
        param :units, Array, required: true, desc: N_('List of content units to import')

        def create_units
          resolved = ::ForemanAnsibleDirector::AnsibleContent::AnsibleContentHelpers.resolve_import_payload(
            params[:units]
          )
          @bulk_create_task = ForemanTasks.sync_task(
            ::ForemanAnsibleDirector::Actions::AnsibleContentUnit::Bulk::Import,
            resolved_content_units: resolved,
            organization_id: @organization.id
          )
        end

        api :GET, '/ansible_content/', N_('List ansible content units')
        param :organization_id, Integer, required: false
        param_group :search_and_pagination, ::Api::V2::BaseController
        add_scoped_search_description_for(::ForemanAnsibleDirector::ContentUnit)

        def index
          scope = resource_scope_for_index
          @ansible_content_units = if @organization
                                     scope.where(organization_id: @organization.id)
                                   else
                                     scope
                                   end
        end

        api :GET, '/ansible_content/:version', N_('Show ansible content unit version')
        param :version, :identifier_dottable, required: true

        def version_detail
          @content_unit_version = ::ForemanAnsibleDirector::ContentUnitVersion.find_by(id: params[:version])
        end

        # TODO: This needs to check and invalidate built EEs
        api :DELETE, '/ansible_content/', N_('Remove ansible content units')
        param :organization_id, Integer, required: true
        param :units, Array, required: true, desc: N_('List of content units to remove')

        def destroy_units
          resolved = ::ForemanAnsibleDirector::AnsibleContent::AnsibleContentHelpers.resolve_destroy_payload(
            params[:units]
          )
          @bulk_destroy_task =
            ForemanTasks.sync_task(::ForemanAnsibleDirector::Actions::AnsibleContentUnit::Bulk::Destroy,
              resolved_content_units: resolved, organization_id: @organization.id)
        end

        def model_of_controller
          resource_class
        end

        private

        def validate_requirements_payload
          # TODO: Grammar
          params.require(:requirements_file)
        end

        def resource_class
          ::ForemanAnsibleDirector::ContentUnit
        end

        def index_relation
          units = AnsibleContentUnit
          units.where organization_id: (params[:organization_id] || @organization.id)
        end
      end
    end
  end
end
