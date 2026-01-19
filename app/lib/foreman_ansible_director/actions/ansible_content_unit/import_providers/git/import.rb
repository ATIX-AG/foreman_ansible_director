# frozen_string_literal: true

module ForemanAnsibleDirector
  module Actions
    module AnsibleContentUnit
      module ImportProviders
        module Git
          class Import < ::ForemanAnsibleDirector::Actions::Base::AnsibleDirectorAction
            input_format do
              param :unit, Object, required: true # SimpleAnsibleContentUnit
              param :organization_id, required: true
            end

            def plan(args)
              unit = args[:unit]

              git_ls_remote_action = plan_action(
                ::ForemanAnsibleDirector::Actions::GitOps::LsRemote,
                git_remote: unit.source
              )

              case unit.unit_type
              when :collection

                unit.versions.each do |version|
                  plan_action(
                    ::ForemanAnsibleDirector::Actions::AnsibleContentUnit::ImportProviders::Git::ImportCollection,
                    unit: unit,
                    unit_version: version,
                    git_ls_remote: git_ls_remote_action.output,
                    organization_id: args[:organization_id]
                  )
                end
              when :role
                plan_action(
                  ::ForemanAnsibleDirector::Actions::AnsibleContentUnit::ImportProviders::Galaxy::ImportRole,
                  unit: unit,
                  organization_id: args[:organization_id]
                )

              else
                raise NotImplementedError
              end
            end
          end
        end
      end
    end
  end
end
