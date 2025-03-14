module Actions
  module ForemanPulsible
    module AnsibleContentUnit
      class Index < ::Actions::ForemanPulsible::Base::PulsibleAction

        input_format do
          param :repository_href, String, required: true
          param :content_unit_type, Symbol, required: true
          param :unit_name, String, required: true
          param :unit_namespace, String, required: true
        end

        output_format do
          param :index_content_response, Hash
        end

        def plan(args)
          sequence do
            repository_show_action = plan_action(
              ::Actions::ForemanPulsible::Pulp3::Ansible::Repository::Show,
              repository_href: args[:repository_href]
            )
            if args[:content_unit_type] == :collection
              list_action = plan_action(
                ::Actions::ForemanPulsible::Pulp3::Ansible::Content::Collection::List,
                repository_version_href: repository_show_action.output[:repository_show_response][:latest_version_href]
              )
            else
              list_action = plan_action(
                ::Actions::ForemanPulsible::Pulp3::Ansible::Content::Role::List,
                repository_version_href: repository_show_action.output[:repository_show_response][:latest_version_href]
              )
            end

            plan_self(
              args.merge(
                list_action_output: list_action.output,
                repository_show_action_output: repository_show_action.output)
            )
          end
        end

        def run
          unit_versions = []
          list_results = input.dig(:list_action_output, :repository_artifacts, :results)

          if list_results
            list_results.each do |result|
              unit_versions.push(result.slice(:artifact, :version, :sha256))
            end

          else
            # If we are here, something went wrong...
            # TODO: Handle inconsistent state
          end

          input.update(indexed_unit_versions: unit_versions)
        end

        def finalize
          unit_versions = input[:indexed_unit_versions]

          if input[:index_mode] == "import"

            if input[:content_unit_type] == 'collection'
              unit_record = AnsibleCollection.new(
                {
                  name: input[:unit_name],
                  namespace: input[:unit_namespace],
                  latest_version_href: input[:repository_show_action_output][:repository_show_response][:latest_version_href],
                  pulp_repository_href: input[:repository_href],
                  pulp_remote_href: input[:remote_href],
                  pulp_distribution_href: input[:distribution_href]
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
                  pulp_distribution_href: input[:distribution_href]
                }
              )
            end
            unit_versions.each do |version|
              unit_record.ansible_content_versions.new(
                version: version[:version],
                artifact_href: version[:artifact],
                sha256: version[:sha256],
                source: input[:content_unit_source],
              )
            end
            unit_record.save

          elsif input[:index_mode] == "update"

            if input[:content_unit_type] == 'collection'
              existing_unit = AnsibleCollection.find_by(pulp_repository_href: input[:repository_href])
              existing_unit_versions = existing_unit.ansible_content_versions.pluck(:version)

              existing_unit.update(latest_version_href: input[:repository_show_action_output][:repository_show_response][:latest_version_href])

              new_unit_versions = unit_versions.select { |unit_version| !existing_unit_versions.include?(unit_version[:version]) }

              new_unit_versions.each do |new_version|
                existing_unit.ansible_content_versions << AnsibleContentVersion.new(
                  version: new_version[:version],
                  artifact_href: new_version[:artifact],
                  sha256: new_version[:sha256],
                  source: input[:content_unit_source],
                )
              end
            else
              # TODO: Role version support
            end
          end
        end
      end
    end
  end
end