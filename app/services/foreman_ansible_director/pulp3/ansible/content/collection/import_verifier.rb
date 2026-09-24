# frozen_string_literal: true

module ForemanAnsibleDirector
  module Pulp3
    module Ansible
      module Content
        module Collection
          # Verifies that every collection listed in a requirements.yml-style
          # requirements file was actually imported, by comparing it against the
          # artifacts returned by ForemanAnsibleDirector::Actions::Pulp3::Ansible::Content::Collection::List
          class ImportVerifier
            # @param requirements [String] YAML requirements file (`{ 'collections' => [{ 'name', 'version' }, ...] }`)
            # @param imported_results [Array<Hash>, nil] `results` array from a Content::Collection::List response
            def initialize(requirements, imported_results)
              @requirements = requirements
              @imported_results = imported_results || []
            end

            # @return [Array<Hash>] the requested collections that could not be found among the imported results
            def missing_collections
              requested_collections.reject { |collection| imported?(collection) }
            end

            private

            def requested_collections
              (YAML.safe_load(@requirements) || {})['collections'] || []
            end

            def imported_versions
              @imported_versions ||= @imported_results.each_with_object(
                Hash.new { |hash, key| hash[key] = [] }
              ) do |result, memo|
                namespace = result[:namespace] || result['namespace']
                name = result[:name] || result['name']
                version = result[:version] || result['version']
                memo["#{namespace}.#{name}"] << version
              end
            end

            def imported?(collection)
              versions = imported_versions[collection['name']]
              return false if versions.nil?
              return versions.include?(collection['version']) if collection['version']
              versions.any?
            end
          end
        end
      end
    end
  end
end
