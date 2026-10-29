# frozen_string_literal: true

module ForemanAnsibleDirector
  module Actions
    module AnsibleContentUnit
      module ImportProviders
        module Galaxy
          # Cleans up the repository/distribution/remote Pulp objects created for an import.
          #
          # This action is planned twice by ImportCollection:
          # - Right after the create actions, to clean up and fail the import if any of the Pulp
          #   objects failed to be created (+pulp_failure+).
          # - After indexing/verification, to clean up objects that are orphaned because the
          #   import ended up with no content at all, e.g. because every requested
          #   collection/version was invalid. This case does not fail the import (+pulp_failure+
          #   is false) - the surrounding task still finishes with a warning, raised by
          #   VerifyCollectionImport.
          class Rescue < ::ForemanAnsibleDirector::Actions::Base::AnsibleDirectorAction
            input_format do
              param :repository_href, String, required: true
              param :distribution_href, String, required: true
              param :remote_href, String, required: true
              param :skip_repository_cleanup, Boolean
              param :skip_distribution_cleanup, Boolean
              param :skip_remote_cleanup, Boolean
              param :pulp_failure, Boolean
            end

            def plan(args)
              plan_action(::ForemanAnsibleDirector::Actions::Pulp3::Ansible::Repository::Destroy,
                repository_href: args[:repository_href],
                skip: args[:skip_repository_cleanup])
              plan_action(::ForemanAnsibleDirector::Actions::Pulp3::Ansible::Distribution::Destroy,
                distribution_href: args[:distribution_href],
                skip: args[:skip_distribution_cleanup])
              plan_action(::ForemanAnsibleDirector::Actions::Pulp3::Ansible::Remote::Collection::Destroy,
                collection_remote_href: args[:remote_href],
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
