# frozen_string_literal: true

module ForemanAnsibleDirector
  module Api
    module V2
      class AnsibleDirectorApiController < ::Api::V2::BaseController
        include ::Api::Version2
        include ::ForemanAnsibleDirector::Concerns::FilteredAutoCompleteSearch

        include ::ForemanAnsibleDirector::RequestCtx::RequestContextHelper

        around_action :attach_request_ctx

        def attach_request_ctx
          ::ForemanAnsibleDirector::RequestCtx::RequestContext.with_context(
            ::ForemanAnsibleDirector::RequestCtx::RequestContext.new(request.request_id)
          ) do
            @ctx = ctx
            yield
          end
        end

        def find_organization
          @organization = find_optional_organization || Organization.current
          if @organization.nil?
            render_error(
              'custom_error',
              status: :unprocessable_entity,
              locals: {
                message: "One of parameters [ #{organization_id_keys.join(', ')} ] required but not specified.",
              }
            )
          end
          @organization
        end

        def organization_scoped_resource_scope(scope = resource_class.all)
          return scope.none if User.current.blank?
          organization = @organization || Organization.current
          if organization.nil?
            if User.current.admin?
              scope
            else
              scope.where(organization_id: User.current.my_organizations)
            end
          else
            scope.where(organization_id: organization.id)
          end
        end

        def action_permission
          case params[:action]
          when 'auto_complete_search'
            :view
          else
            super
          end
        end

        private

        def organization_id_keys
          [:organization_id]
        end

        def organization_id
          params.values_at(*organization_id_keys).compact.first
        end

        def find_optional_organization
          org_id = organization_id
          return unless org_id

          @organization = get_organization(org_id)
          if @organization.nil?
            render_error('custom_error', status: :not_found,
                          locals: { message: "Couldn't find organization #{org_id}" })
          end
          @organization
        end

        def get_organization(org_id)
          Organization.find_by(id: org_id)
        end
      end
    end
  end
end
