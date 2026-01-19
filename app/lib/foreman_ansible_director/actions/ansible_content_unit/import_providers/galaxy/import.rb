# frozen_string_literal: true

module ForemanAnsibleDirector
  module Actions
    module AnsibleContentUnit
      module ImportProviders
        module Galaxy
          class Import < ::ForemanAnsibleDirector::Actions::Base::AnsibleDirectorAction
            input_format do
              param :unit, Object, required: true # SimpleAnsibleContentUnit
              param :organization_id, required: true
            end

            def plan(args)
              unit = args[:unit]

              case unit.unit_type
              when :collection
                plan_action(
                  ::ForemanAnsibleDirector::Actions::AnsibleContentUnit::ImportProviders::Galaxy::ImportCollection,
                  unit: unit,
                  organization_id: args[:organization_id]
                )
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
