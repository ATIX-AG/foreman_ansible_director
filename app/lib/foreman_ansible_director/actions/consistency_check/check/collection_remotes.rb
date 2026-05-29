# frozen_string_literal: true

module ForemanAnsibleDirector
  module Actions
    module ConsistencyCheck
      module Check
        class CollectionRemotes < ::ForemanAnsibleDirector::Actions::Base::AnsibleDirectorAction
          input_format do
          end

          output_format do
            param :unreferenced_collection_remote_hrefs, Array
          end

          def plan(*_args)
            all_referenced_collection_remote_hrefs = Set.new
            all_referenced_collection_remote_hrefs.merge(
              ::ForemanAnsibleDirector::ContentUnitVersion.unscoped.where(
                versionable_type: 'ForemanAnsibleDirector::AnsibleCollection',
                source_type: 'galaxy'
              ).all.pluck(:pulp_remote_href)
            )

            collection_remote_list_action = plan_action(
              ::ForemanAnsibleDirector::Actions::Pulp3::Ansible::Remote::Collection::ListAll
            )
            plan_self(
              all_referenced_collection_remote_hrefs: all_referenced_collection_remote_hrefs.to_a,
              collection_remote_list_action: collection_remote_list_action.output
            )
          end

          def run
            all_referenced_collection_remote_hrefs = Set.new(input[:all_referenced_collection_remote_hrefs])
            all_pulp_collection_remote_hrefs = input[:collection_remote_list_action][:collection_remote_list_response]

            unreferenced_collection_remote_hrefs = []

            all_pulp_collection_remote_hrefs.each do |collection_remote|
              pulp_href = collection_remote[:pulp_href]
              unless all_referenced_collection_remote_hrefs.include?(pulp_href)
                unreferenced_collection_remote_hrefs << pulp_href
              end
            end

            output.update(unreferenced_collection_remote_hrefs: unreferenced_collection_remote_hrefs)
          end
        end
      end
    end
  end
end
