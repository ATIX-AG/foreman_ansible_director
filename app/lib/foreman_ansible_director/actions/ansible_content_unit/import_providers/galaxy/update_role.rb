# frozen_string_literal: true

module ForemanAnsibleDirector
  module Actions
    module AnsibleContentUnit
      module ImportProviders
        module Galaxy
          class UpdateRole < ::ForemanAnsibleDirector::Actions::Base::AnsibleDirectorAction
            input_format do
              param :unit, Object, required: true # SimpleAnsibleContentUnit
              param :organization_id, required: true
            end

            def plan(args)
            end
          end
        end
      end
    end
  end
end
