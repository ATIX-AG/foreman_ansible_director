# frozen_string_literal: true

module Actions
  module ForemanAnsibleDirector
    module AnsibleContentUnit
      class Index < ::Actions::ForemanAnsibleDirector::Base::AnsibleDirectorAction
        input_format do
          param :repository_href, String, required: true
          param :content_unit_type, Symbol, required: true
          param :unit_name, String, required: true
          param :unit_namespace, String, required: true
          param :organization_id, Integer, required: true
        end

        output_format do
          param :index_content_response, Hash
        end

        def plan(args)
          sequence do
            repository_show_action = plan_action(
              ::Actions::ForemanAnsibleDirector::Pulp3::Ansible::Repository::Show,
              repository_href: args[:repository_href]
            )
            if args[:content_unit_type] == :collection
              list_action = plan_action(
                ::Actions::ForemanAnsibleDirector::Pulp3::Ansible::Content::Collection::List,
                repository_version_href: repository_show_action.output[:repository_show_response][:latest_version_href]
              )
            else
              list_action = plan_action(
                ::Actions::ForemanAnsibleDirector::Pulp3::Ansible::Content::Role::List,
                repository_version_href: repository_show_action.output[:repository_show_response][:latest_version_href]
              )
            end

            plan_self(
              args.merge(
                list_action_output: list_action.output,
                repository_show_action_output: repository_show_action.output
              )
            )
          end
        end

        def run
          unit_versions = []
          imported_versions = input.dig(:list_action_output, :repository_artifacts, :results)

          raise unless imported_versions
          imported_versions.each do |result|
            sliced = result.slice(:artifact, :version, :sha256)
            if input[:content_unit_type] == 'collection'
              unit_contents = result.slice(:contents)
              unit_contents = unit_contents[:contents].select { |cu| cu['content_type'] == 'role' }
              unit_contents = unit_contents.map { |cu| cu['name'] }
              sliced[:collection_roles] = unit_contents
            end
            unit_versions.push(sliced)
          end

          input.update(indexed_unit_versions: unit_versions)
        end

        def finalize
          # rubocop:disable Layout/LineLength
          unit_versions = input[:indexed_unit_versions]

          case input[:index_mode]
          when 'import'

            if input[:content_unit_type] == 'collection'
              unit_record = AnsibleCollection.create!(
                {
                  name: input[:unit_name],
                  namespace: input[:unit_namespace],
                  source: input[:content_unit_source],
                  latest_version_href: input[:repository_show_action_output][:repository_show_response][:latest_version_href],
                  pulp_repository_href: input[:repository_href],
                  pulp_remote_href: input[:remote_href],
                  pulp_distribution_href: input[:distribution_href],
                  organization_id: input[:organization_id],
                }
              )
            else
              # Make intellisense shut up - input[:content_unit_type] == 'role'
              unit_record = AnsibleRole.new(
                {
                  name: input[:unit_name],
                  namespace: input[:unit_namespace],
                  latest_version_href: input[:repository_show_action_output][:repository_show_response][:latest_version_href],
                  pulp_repository_href: input[:repository_href],
                  pulp_remote_href: input[:remote_href],
                  pulp_distribution_href: input[:distribution_href],
                  organization_id: input[:organization_id],
                }
              )
            end
            unit_versions.each do |version|
              content_unit_version = ContentUnitVersion.create!(
                versionable: unit_record,
                version: version[:version],
                versionable_type: unit_record.class.to_s
              )

              next unless unit_record.is_a?(AnsibleCollection)

              version[:collection_roles].each do |collection_role|
                content_unit_version.ansible_collection_roles.create!(
                  name: collection_role
                )
              end
            end

          when 'update'

            existing_unit = AnsibleCollection.find_by(pulp_repository_href: input[:repository_href])
            existing_unit_versions = existing_unit.content_unit_versions.pluck(:version)

            existing_unit.update(latest_version_href: input[:repository_show_action_output][:repository_show_response][:latest_version_href])

            new_unit_versions = unit_versions.reject do |unit_version|
              existing_unit_versions.include?(unit_version[:version])
            end

            new_unit_versions.each do |new_version|
              existing_unit.content_unit_versions << ContentUnitVersion.new(
                versionable: existing_unit,
                version: new_version[:version],
                versionable_type: unit_record.class.to_s
              )
            end
          end
          # rubocop:enable Layout/LineLength
        end
      end
    end
  end
end
