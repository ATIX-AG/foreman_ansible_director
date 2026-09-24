# frozen_string_literal: true

module ForemanAnsibleDirector
  module Actions
    module AnsibleContentUnit
      module ImportProviders
        module Galaxy
          # Verifies that every version listed in a requirements.yml-style requirements file for a
          # single collection was actually imported into the repository, comparing it against the
          # versions indexed by ForemanAnsibleDirector::Actions::AnsibleContentUnit::Index::IndexStatic
          # (i.e. the versions whose variables were successfully extracted).
          #
          # The requirements file is always generated for this one collection (see
          # SimpleAnsibleContentUnit#collection_file / AnsibleCollection#requirements_file), so there
          # is no need to cross-reference namespace/name - only the requested versions matter here.
          #
          # Versions that cannot be imported (e.g. because they don't exist) do not block the rest
          # of the indexing: this action is configured to be skipped on failure, so the surrounding
          # task finishes with a "warning" result instead of failing outright, while everything that
          # *could* be imported still is.
          class VerifyCollectionImport < ::ForemanAnsibleDirector::Actions::Base::AnsibleDirectorAction
            input_format do
              param :requirements, String, required: true
              param :unit_namespace, String, required: true
              param :unit_name, String, required: true
              # The :indexed_unit_versions output of IndexStatic - an array of
              # { version:, collection_roles: } hashes for every version that was actually indexed.
              param :indexed_unit_versions, Object, required: true
              param :skip, Boolean, required: false
            end

            def run
              return if input[:skip]

              indexed_versions = input[:indexed_unit_versions].map { |unit_version| unit_version[:version] }
              requested_versions = requested_collections.map { |collection| collection['version'] }.compact

              # No version pinned in the requirements (i.e. "import the latest version"): satisfied
              # as long as something was imported.
              if requested_versions.empty?
                raise "No version of '#{unit_identifier}' could be imported" if indexed_versions.empty?
                return
              end

              missing_versions = requested_versions - indexed_versions
              return if missing_versions.empty?

              raise "The following version(s) of '#{unit_identifier}' could not be imported: " \
                    "#{missing_versions.join(', ')}"
            end

            def rescue_strategy_for_self
              Dynflow::Action::Rescue::Skip
            end

            private

            def requested_collections
              (YAML.safe_load(input[:requirements]) || {})['collections'] || []
            end

            def unit_identifier
              "#{input[:unit_namespace]}.#{input[:unit_name]}"
            end
          end
        end
      end
    end
  end
end
