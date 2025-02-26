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
            list_action = plan_action(::Actions::ForemanPulsible::Pulp3::Ansible::Content::Collection::List, repository_href: args[:repository_href],)
            plan_self(args.merge(list_action_output: list_action.output))
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
          units.each do |unit| # TODO: Implement Update workflow
            if input[:content_unit_type] == 'collection'
              unit_record = AnsibleCollection.new(
                unit[:unit].merge(
                    pulp_repository_href: input[:repository_href],
                    pulp_remote_href: input[:remote_href],
                    pulp_distribution_href: input[:distribution_href],
                )
              )
            else input[:content_unit_type] == 'role' # PCU type is validated in parent
              # TODO: Role support
            end
            unit_record.ansible_content_versions.new(
              version: unit[:version][:version],
              artifact_href: unit[:version][:artifact],
              sha256: unit[:version][:sha256]
            )
            unit_record.save
          end
        end
      end
    end
  end
end