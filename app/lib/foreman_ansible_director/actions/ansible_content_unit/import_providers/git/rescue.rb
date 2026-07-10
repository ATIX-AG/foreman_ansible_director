# frozen_string_literal: true

module ForemanAnsibleDirector
  module Actions
    module AnsibleContentUnit
      module ImportProviders
        module Git
          # Very similar to the Galaxy::Rescue action. May be refactored.
          class Rescue < ::ForemanAnsibleDirector::Actions::Base::AnsibleDirectorAction
            input_format do
              param :repository_create_action, Hash
              param :distribution_create_action, Hash
              param :git_remote_create_action, Hash
              param :skip_repository_cleanup, Boolean
              param :skip_distribution_cleanup, Boolean
              param :skip_remote_cleanup, Boolean
              param :pulp_failure, Boolean
            end

            def plan(args)
              repository_create_action = args[:repository_create_action]
              distribution_create_action = args[:distribution_create_action]
              collection_remote_create_action = args[:git_remote_create_action]

              repository_href = repository_create_action['repository_create_response']['pulp_href']
              distribution_href = distribution_create_action['distribution_create_response']['pulp_href']
              remote_href = collection_remote_create_action['git_remote_create_response']['pulp_href']

              plan_action(::ForemanAnsibleDirector::Actions::Pulp3::Ansible::Repository::Destroy,
                repository_href: repository_href,
                skip: args[:skip_repository_cleanup])
              plan_action(::ForemanAnsibleDirector::Actions::Pulp3::Ansible::Distribution::Destroy,
                distribution_href: distribution_href,
                skip: args[:skip_distribution_cleanup])
              plan_action(::ForemanAnsibleDirector::Actions::Pulp3::Ansible::Remote::Git::Destroy,
                git_remote_href: remote_href,
                skip: args[:skip_remote_cleanup])

              plan_self(
                pulp_failure: args[:pulp_failure]
              )
            end

            def run
              pulp_failure = input[:pulp_failure]

              # Raising an exception to mark this execution plan as failed
              raise 'A preceding action failed. Artifacts were cleaned up successfully.' if pulp_failure
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
