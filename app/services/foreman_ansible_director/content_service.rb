# frozen_string_literal: true

module ForemanAnsibleDirector
  class ContentService
    class << self
      def create_content_unit_revision(cur_create)
        ActiveRecord::Base.transaction do
          ::ForemanAnsibleDirector::ContentUnitRevision.create!(
            content_unit_version_id: cur_create[:cuv_id],
            git_ref: cur_create[:git_ref],
            latest_version_href: cur_create[:latest_version_href],
            pulp_repository_href: cur_create[:pulp_repository_href],
            pulp_remote_href: cur_create[:pulp_remote_href],
            pulp_distribution_href: cur_create[:pulp_distribution_href]
          )
        end
      end

      def create_ansible_collection(name:,
                                    namespace:,
                                    source:,
                                    source_type:,
                                    organization_id:,
                                    latest_version_href: '',
                                    pulp_repository_href: '',
                                    pulp_remote_href: '',
                                    pulp_distribution_href: '',
                                    meta: false)

        # rubocop:disable Style/GuardClause
        if meta
          raise NotImplementedError
        else
          ActiveRecord::Base.transaction do
            ::ForemanAnsibleDirector::AnsibleCollection.create!(
              name: name,
              namespace: namespace,
              source: source,
              source_type: source_type,
              latest_version_href: latest_version_href,
              pulp_repository_href: pulp_repository_href,
              pulp_distribution_href: pulp_distribution_href,
              pulp_remote_href: pulp_remote_href,
              organization_id: organization_id
            )
          end
        end
        # rubocop:enable Style/GuardClause
      end

      def create_ansible_collection_version(
        collection:,
        version:,
        dynamic: false
      )

        ActiveRecord::Base.transaction do
          ::ForemanAnsibleDirector::ContentUnitVersion.create!(
            versionable: collection,
            version: version,
            dynamic: dynamic
          )
        end
      end

      def create_collection_role(collection:, name:)
        ActiveRecord::Base.transaction do
          collection.ansible_collection_roles.create!(
            name: name
          )
        end
      end
    end
  end
end
