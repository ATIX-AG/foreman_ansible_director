# frozen_string_literal: true

module ForemanAnsibleDirector
  module Actions
    module AnsibleContentUnit
      module ImportProviders
        module Galaxy
          class Rescue < ::ForemanAnsibleDirector::Actions::Base::AnsibleDirectorAction
            input_format do
              param :repository_create_action, Hash
              param :distribution_create_action, Hash
              param :collection_remote_create_action, Hash
              param :skip_repository_cleanup, Boolean
              param :skip_distribution_cleanup, Boolean
              param :skip_remote_cleanup, Boolean
            end

            def plan(args)
              repository_create_action = args[:repository_create_action]
              distribution_create_action = args[:distribution_create_action]
              collection_remote_create_action = args[:collection_remote_create_action]

              repository_href = repository_create_action['repository_create_response']['pulp_href']
              distribution_href = distribution_create_action['distribution_create_response']['pulp_href']
              remote_href = collection_remote_create_action['collection_remote_create_response']['pulp_href']

              plan_action(::ForemanAnsibleDirector::Actions::Pulp3::Ansible::Repository::Destroy,
                repository_href: repository_href,
                skip: args[:skip_repository_cleanup])
              plan_action(::ForemanAnsibleDirector::Actions::Pulp3::Ansible::Distribution::Destroy,
                distribution_href: distribution_href,
                skip: args[:skip_distribution_cleanup])
              plan_action(::ForemanAnsibleDirector::Actions::Pulp3::Ansible::Remote::Collection::Destroy,
                collection_remote_href: remote_href,
                skip: args[:skip_remote_cleanup])

              plan_self(
                skip_repository_cleanup: args[:skip_repository_cleanup],
                skip_distribution_cleanup: args[:skip_distribution_cleanup],
                skip_remote_cleanup: args[:skip_remote_cleanup]
              )
            end

            def run
              skip_repository_cleanup = input[:skip_repository_cleanup]
              skip_distribution_cleanup = input[:skip_distribution_cleanup]
              skip_remote_cleanup = input[:skip_remote_cleanup]

              skip_all = skip_repository_cleanup && skip_distribution_cleanup && skip_remote_cleanup
              # Raising an exception to mark this execution plan as failed
              raise 'A preceeding action failed. Artifacts were cleaned up successfully.' unless skip_all
            end

            def rescue_strategy_for_self
              Dynflow::Action::Rescue::Fail
            end
          end
        end
      end
    end
  end
end
