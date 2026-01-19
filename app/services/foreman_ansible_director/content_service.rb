# frozen_string_literal: true

module ForemanAnsibleDirector
  class ContentService
    class << self
      def create_content_unit_revision(cuv_id:,
                                       git_ref:,
                                       latest_version_href:,
                                       pulp_repository_href:,
                                       pulp_remote_href:,
                                       pulp_distribution_href:
      )
        ActiveRecord::Base.transaction do
          ::ForemanAnsibleDirector::ContentUnitRevision.create!(
            content_unit_version_id: cuv_id,
            git_ref: git_ref,
            latest_version_href: latest_version_href,
            pulp_repository_href: pulp_repository_href,
            pulp_remote_href: pulp_remote_href,
            pulp_distribution_href: pulp_distribution_href
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
                                    meta: false
      )

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

      def create_collection_role(
        collection:,
        name:
      )
        ActiveRecord::Base.transaction do
          collection.ansible_collection_roles.create!(
            name: name
          )
        end
      end

      def create_collection_role_for_revision(
        revision:,
        name:
      )
        ActiveRecord::Base.transaction do
          ::ForemanAnsibleDirector::AnsibleCollectionRole.create!(
            name: name,
            content_unit_revision_id: revision.id
          )
        end
      end

      def create_revision_activator(
        consumable_type:,
        consumable_id:,
        revision_id:
      )

        ActiveRecord::Base.transaction do
          ::ForemanAnsibleDirector::ActiveRevision.create!(
            consumable_id: consumable_id,
            consumable_type: consumable_type,
            content_unit_revision_id: revision_id,
          )
        end
      end
    end
  end
end
