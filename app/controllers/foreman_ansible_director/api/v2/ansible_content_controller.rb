# frozen_string_literal: true

module ForemanAnsibleDirector
  module Api
    module V2
      class AnsibleContentController < AnsibleDirectorApiController
        before_action :find_organization, only: %i[create_units]
        # rubocop:disable Rails/LexicallyScopedActionFilter
        before_action :find_optional_organization, only: %i[index auto_complete_search]
        # rubocop:enable Rails/LexicallyScopedActionFilter

        resource_description { resource_id 'AD Ansible Content' }

        # region ApiDoc: POST /api/v2/ansible_director/ansible_content
        api :POST, '/v2/ansible_director/ansible_content', N_('Import Ansible content units')
        param :organization_id, :number, desc: N_('Organization identifier.'), required: true
        param :units, Array, desc: N_('Array of content units to import.'), required: true do
          param :unit_name,
            String,
            desc: N_('Identifier of the content unit.'),
            example: N_('manala.roles'),
            required: true
          param :unit_type,
            %w[role collection],
            desc: N_('Type of the content unit.'),
            example: N_('collection'),
            required: true
          param :unit_source_type,
            %w[galaxy git],
            desc: N_('Source type of the content unit.'),
            example: N_('galaxy'),
            required: true
          param :unit_source,
            String,
            desc: N_('Source URL or path for the content unit (e.g., Galaxy URL or Git repo).'),
            example: N_('https://galaxy.ansible.com'),
            required: true
          param :unit_versions,
            Array,
            desc: N_('An array of versions to import (e.g., ["1.0.0", "2.0.0"]).'),
            example: %w[1.0.0 2.0.0],
            required: true
        end
        # TRANSLATORS: ApiDoc, do not translate!
        example <<~EXAMPLE
          {
            "organization_id": 1,
            "units": [
              {
                "unit_name": "manala.roles",
                "unit_type": "collection",
                "unit_source_type": "galaxy",
                "unit_source": "https://galaxy.ansible.com",
                "unit_versions": ["5.2.0"]
              }
            ]
          }
        EXAMPLE
        # endregion
        def create_units
          resolved = ::ForemanAnsibleDirector::AnsibleContent::AnsibleContentHelpers.resolve_import_payload(
            params[:units]
          )
          @bulk_create_task = ::ForemanAnsibleDirector::ActionService.trigger(
            ::ForemanAnsibleDirector::Actions::AnsibleContentUnit::Bulk::Import,
            task_args: {
              resolved_content_units: resolved,
              organization_id: @organization.id,
            }
          )
        end

        # region ApiDoc: GET /api/v2/ansible_director/ansible_content
        api :GET, '/v2/ansible_director/ansible_content', N_('List Ansible content units')
        param :organization_id, :number, desc: N_('Organization identifier'), required: false
        param_group :search_and_pagination, ::Api::V2::BaseController
        # endregion
        def index
          @ansible_content_units = resource_scope_for_index
        end

        # region ApiDoc: GET /api/v2/ansible_director/ansible_content/:content_unit_id/versions/:content_unit_version_id
        api :GET, '/v2/ansible_director/ansible_content/:content_unit_id/versions/:content_unit_version_id',
          N_('Show details of a specific Ansible content unit version')
        # endregion
        def version_detail
          @content_unit_version = ::ForemanAnsibleDirector::ContentUnitVersion.find_by(id: params[:version])
        end

        # TODO: This needs to check and invalidate built EEs
        # region ApiDoc: DELETE /api/v2/ansible_director/ansible_content
        api :DELETE, '/v2/ansible_director/ansible_content',
          N_('Destroy previously imported Ansible content units.')
        param :units, Array, desc: N_('Array of content units to destroy.'), required: true do
          param :unit_id, :number, desc: N_('ID of the Ansible content unit to destroy.'), required: true
          # TRANSLATORS: ApiDoc, do not translate!
          param :unit_version_ids, Array,
            desc: <<~DESC,
              Array of version IDs to delete.
              Optional: If not supplied, every version of the given content unit will be deleted.
            DESC
            required: false
        end
        # TRANSLATORS: ApiDoc, do not translate!
        example <<~EXAMPLE
          {
            "units": [
              {
                "unit_id": 42,
                "unit_version_ids": [101, 102]
              },
              {
                "unit_id": 43,
                "unit_version_ids": [105]
              }
            ]
          }
        EXAMPLE
        # endregion
        def destroy_units
          resolved = ::ForemanAnsibleDirector::AnsibleContent::AnsibleContentHelpers.resolve_destroy_payload(
            destroy_params
          )
          @bulk_destroy_task = ::ForemanAnsibleDirector::ActionService.trigger(
            ::ForemanAnsibleDirector::Actions::AnsibleContentUnit::Bulk::Destroy,
            task_args: {
              resolved_content_units: resolved,
            }
          )
        end

        # region ApiDoc: POST /api/v2/ansible_director/ansible_content/consistency_check
        api :POST, '/v2/ansible_director/ansible_content/consistency_check',
          N_('Run a consistency check to clean up the database after a failed content import.')
        # endregion
        def consistency_check
          @consistency_check = ::ForemanAnsibleDirector::ActionService.trigger(
            ::ForemanAnsibleDirector::Actions::ConsistencyCheck::Perform
          )
        end

        def model_of_controller
          resource_class
        end

        def resource_scope
          organization_scoped_resource_scope
        end

        private

        def destroy_params
          params.require(:units).map do |unit|
            unit.permit(
              :unit_id,
              unit_version_ids: []
            )
          end
        end

        def validate_requirements_payload
          # TODO: Grammar
          params.require(:requirements_file)
        end

        def resource_class
          ::ForemanAnsibleDirector::ContentUnit
        end
      end
    end
  end
end
