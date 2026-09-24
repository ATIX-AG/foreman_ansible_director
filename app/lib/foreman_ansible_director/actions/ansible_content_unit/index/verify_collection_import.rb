# frozen_string_literal: true

module ForemanAnsibleDirector
  module Actions
    module AnsibleContentUnit
      module Index
        # Verifies that every collection listed in a requirements.yml-style requirements file
        # was actually imported into the repository, comparing it against the artifacts listed by
        # ForemanAnsibleDirector::Actions::Pulp3::Ansible::Content::Collection::List.
        #
        # Collections that cannot be imported (e.g. because they don't exist, or the requested
        # version doesn't exist) do not block the rest of the indexing: this action is configured
        # to be skipped on failure, so the surrounding task finishes with a "warning" result
        # instead of failing outright, while everything that *could* be imported still is.
        class VerifyCollectionImport < ::ForemanAnsibleDirector::Actions::Base::AnsibleDirectorAction
          input_format do
            param :requirements, String, required: true
            param :list_action_output, Object, required: true
            param :skip, Boolean, required: false
          end

          def run
            return if input[:skip]

            imported_results = input.dig(:list_action_output, :repository_artifacts, :results)

            missing_collections = ::ForemanAnsibleDirector::Pulp3::Ansible::Content::Collection::ImportVerifier.new(
              input[:requirements], imported_results
            ).missing_collections

            return if missing_collections.empty?

            descriptions = missing_collections.map do |collection|
              collection['version'] ? "#{collection['name']} (#{collection['version']})" : collection['name'].to_s
            end

            raise "The following Ansible collection(s) could not be imported: #{descriptions.join(', ')}"
          end

          def rescue_strategy_for_self
            Dynflow::Action::Rescue::Skip
          end
        end
      end
    end
  end
end
