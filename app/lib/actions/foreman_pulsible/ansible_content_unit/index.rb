module Actions
  module ForemanPulsible
    module AnsibleContentUnit
      class Index < ::Actions::ForemanPulsible::Base::PulsibleAction

        input_format do
          param :repository_href, String, required: true
          param :content_unit_type, Symbol, required: true
        end

        def plan(args)
          sequence do
            list_action = plan_action(
              ::Actions::ForemanPulsible::Pulp3::Ansible::Content::Collection::List,
                            repository_href: args[:repository_href],
            )
          end
        end
      end
    end
  end
end