# frozen_string_literal: true

module ForemanAnsibleDirector
  module Api
    module V2
      class AnsibleDirectorApiController < ::Api::V2::BaseController
        include ::Api::Version2

        def find_organization
          @organization = Organization.current || find_optional_organization
          if @organization.nil?
            render_error('custom_error', status: :unprocessable_entity,
              locals: { message: "One of parameters [ #{organization_id_keys.join(', ')} ] required but not specified." })
          end
          @organization
        end

        private

        def finder(type)
          case type

          when 'ACR'
            #@assignment_class = AnsibleContentAssignmentCollectionRole
            ::ForemanAnsibleDirector::AnsibleCollectionRole
          when 'CONTENT'
            ::ForemanAnsibleDirector::ContentUnitVersion
          when 'HOST'
            Host::Managed
          when 'HOSTGROUP'
            Hostgroup
          else
            render_error('custom_error', status: :unprocessable_entity,
                         locals: { message: "#{type} is not supported." })
          end
        end

        def find_target
          finder = finder params[:target]
          @target = finder.find_by(id: params[:target_id])
        end

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
            render_error('custom_error', status: :unprocessable_entity,
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
