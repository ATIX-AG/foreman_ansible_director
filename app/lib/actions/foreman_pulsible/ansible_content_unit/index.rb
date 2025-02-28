module Actions
  module ForemanPulsible
    module AnsibleContentUnit
      class Index < ::Actions::ForemanPulsible::Base::PulsibleAction

        input_format do
          param :repository_href, String, required: true
          param :content_unit_type, Symbol, required: true
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
            list_action = plan_action(
              ::Actions::ForemanPulsible::Pulp3::Ansible::Content::Collection::List,
              repository_version_href: repository_show_action.output[:repository_show_response][:latest_version_href]
            )
            plan_self(
              args.merge(
                list_action_output: list_action.output,
                repository_show_action_output: repository_show_action.output)
            )
          end
        end

        def run
          units = []
          list_results = input.dig(:list_action_output, :repository_artifacts, :results)
          if list_results
            list_results.each do |result| units.append(
              {
                unit: result.slice(:name, :namespace), # See Pulp3 content API response for valid attrs
                version: result.slice(:artifact, :version, :sha256)
              }
            )
            end

          else # If we are here, something went wrong...
               # TODO: Handle inconsistent state
          end

          input.update(indexed_units: units)
        end

        def finalize
          units = input[:indexed_units]

          if input[:index_mode] == "import"

            units.each do |unit|
              if input[:content_unit_type] == 'collection'
                unit_record = AnsibleCollection.new(
                  unit[:unit].merge(
                    latest_version_href: input[:repository_show_action_output][:repository_show_response][:latest_version_href],
                    pulp_repository_href: input[:repository_href],
                    pulp_remote_href: input[:remote_href],
                    pulp_distribution_href: input[:distribution_href],
                  )
                )
              else
                'role' # PCU type is validated in parent
                # TODO: Role support
              end
              unit_record.ansible_content_versions.new(
                version: unit[:version][:version],
                artifact_href: unit[:version][:artifact],
                sha256: unit[:version][:sha256],
                source: input[:content_unit_source],
              )
              unit_record.save
            end

          elsif input[:index_mode] == "update"

            if input[:content_unit_type] == 'collection'
              existing_unit = AnsibleCollection.find_by(pulp_repository_href: input[:repository_href])
              existing_unit_versions = existing_unit.ansible_content_versions.pluck(:version)

              existing_unit.update(latest_version_href: input[:repository_show_action_output][:repository_show_response][:latest_version_href])

              new_unit_versions = units.select { |unit| !existing_unit_versions.include?(unit[:version][:version]) }

              new_unit_versions.each do |new_version|
                existing_unit.ansible_content_versions << AnsibleContentVersion.new(
                  version: new_version[:version][:version],
                  artifact_href: new_version[:version][:artifact],
                  sha256: new_version[:version][:sha256],
                  source: input[:content_unit_source],
                )
              end
            else
                # TODO: Role support
            end
          end
        end
      end
    end
  end
end