# frozen_string_literal: true

module ForemanAnsibleDirector
  module Api
    module V2
      class LifecycleEnvironmentsController < AnsibleDirectorApiController
        include ::Api::Version2

        before_action :find_resource, only: %i[show update destroy update_content content]
        before_action :find_path, only: %i[create]
        before_action :find_organization, only: %i[create update_content]
        before_action :find_assignment_target, only: %i[assign]

        def show
        end

        def content
          @full_content = Foreman::Cast.to_bool params[:full]
        end

        def create
          permitted_params = lifecycle_environment_params
          position = permitted_params.delete(:position) || 0

          ::ForemanAnsibleDirector::LifecycleEnvironmentService.create_environment(
            lce_path: @lifecycle_environment_path,
            name: permitted_params[:name],
            description: permitted_params[:description],
            position: position,
            organization_id: @organization.id
          )
        end

        def update
          permitted_params = lifecycle_environment_update_params

          ::ForemanAnsibleDirector::LifecycleEnvironmentService.edit_environment(
            environment: @lifecycle_environment,
            name: permitted_params[:name],
            description: permitted_params[:description],
            execution_environment_id: permitted_params[:execution_environment_id]
          )
        end

        def update_content
          content_params = content_assignments_params

          unless @lifecycle_environment.root?
            ancestor_names = @lifecycle_environment.ancestors.pluck(:name).join(', ')
            error_message = "LCE #{@lifecycle_environment.name} is not the head link in path " \
              "#{@lifecycle_environment_path.name}. It is preceded by #{ancestor_names}."

            render_error('custom_error',
              status: :unprocessable_entity,
              locals: { message: error_message })
            return
          end

          ::ForemanAnsibleDirector::LifecycleEnvironmentService.assign_content(
            @lifecycle_environment,
            content_params[:content_assignments],
            content_params[:execution_environment_id]
          )
        end

        def assign
          if params[:id] == 'library'
            ::ForemanAnsibleDirector::LifecycleEnvironmentService.assign_library @target
          else
            lce = ::ForemanAnsibleDirector::LifecycleEnvironment.find_by(id: params[:id])
            ::ForemanAnsibleDirector::LifecycleEnvironmentService.assign(
              lce,
              @target
            )
          end
        end

        def destroy
          ::ForemanAnsibleDirector::LifecycleEnvironmentService.destroy_environment @lifecycle_environment
        end

        def resource_scope
          ::ForemanAnsibleDirector::LifecycleEnvironment.all
        end

        private

        def find_assignment_target
          case params[:target_type]
          when 'HOST'
            @target = Host.find(params[:target_id])
          when 'HOSTGROUP'
            @target = Hostgroup.find(params[:target_id])
          else
            render_error(
              'custom_error',
              status: :unprocessable_entity,
              locals: { message: "Unknown target type #{params[:target_type]}" }
            )
          end
        end

        def lifecycle_environment_params
          params.require(:lifecycle_environment).permit(
            :name,
            :description,
            :position
            # content: [
            #  :execution_environment_id,
            #  { content_assignments: %i[id version] },
            # ]
          ).merge(
            # lifecycle_environment_path_id: params[:lifecycle_environment_path_id],
            organization_id: params[:organization_id]
          )
        end

        def lifecycle_environment_update_params
          params.require(:lifecycle_environment).permit(
            :name,
            :description,
            :execution_environment_id
          )
        end

        def content_assignments_params
          params.permit(:organization_id,
            :execution_environment_id,
            content_assignments: %i[id version content_unit_version_id])
        end

        def find_path
          @lifecycle_environment_path = ::ForemanAnsibleDirector::LifecycleEnvironmentPath.find(
            params[:lifecycle_environment_path_id]
          )
        end
      end
    end
  end
end
