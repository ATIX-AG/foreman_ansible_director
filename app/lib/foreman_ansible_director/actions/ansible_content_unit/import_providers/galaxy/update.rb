# frozen_string_literal: true

module ForemanAnsibleDirector
  module Actions
    module AnsibleContentUnit
      module ImportProviders
        module Galaxy
          class Update < ::ForemanAnsibleDirector::Actions::Base::AnsibleDirectorAction
            input_format do
              param :unit, Object, required: true # SimpleAnsibleContentUnit
              param :organization_id, required: true
            end

            def plan(args)
              unit = args[:unit]

              plan_action(
                ::ForemanAnsibleDirector::Actions::AnsibleContentUnit::ImportProviders::Galaxy::UpdateCollection,
                unit: unit,
                organization_id: args[:organization_id]
              )
            end
          end
        end
      end
    end
  end
end
