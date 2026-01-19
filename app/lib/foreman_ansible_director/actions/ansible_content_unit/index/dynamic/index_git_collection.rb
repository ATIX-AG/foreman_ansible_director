# frozen_string_literal: true

module ForemanAnsibleDirector
  module Actions
    module AnsibleContentUnit
      module Index
        module Dynamic
          class IndexGitCollection < ::ForemanAnsibleDirector::Actions::Base::AnsibleDirectorAction
            input_format do
              param :git_ref, String, required: true
              param :repository_href, String, required: true
              param :remote_href, String, required: true
              param :distribution_href, String, required: true
              param :unit_name, String, required: true
              param :unit_namespace, String, required: true
              param :unit_version_id, String, required: true
              param :organization_id, Integer, required: true
              param :activator_type, String, required: true
              param :activator_id, Integer, required: true
            end

            output_format do
              param :index_content_response, Hash
            end

            def plan(args)
              sequence do
                repository_show_action = plan_action(
                  ::ForemanAnsibleDirector::Actions::Pulp3::Ansible::Repository::Show,
                  repository_href: args[:repository_href],
                  skip: false
                )
                list_action = plan_action(
                  ::ForemanAnsibleDirector::Actions::Pulp3::Ansible::Content::Collection::List,
                  repository_version_href: repository_show_action.output[:repository_show_response][:latest_version_href],
                  skip: false
                )


                extract_variables_action = plan_action(
                  ::ForemanAnsibleDirector::Actions::AnsibleContentUnit::ExtractVariables,
                  repository_show_action_output: repository_show_action.output,
                  list_action_output: list_action.output,
                  organization_id: args[:organization_id],
                  unit_name: args[:unit_name],
                  unit_namespace: args[:unit_namespace],
                  unit_name_suffix: args[:git_ref],
                  skip: false
                )

                plan_self(
                  args.merge(
                    list_action_output: list_action.output,
                    repository_show_action_output: repository_show_action.output,
                    extract_variables_action_output: extract_variables_action.output,
                    skip: false
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
                unit_contents = result.slice(:contents)
                unit_contents = unit_contents[:contents].select { |cu| cu['content_type'] == 'role' }
                unit_contents = unit_contents.map { |cu| cu['name'] }
                sliced[:collection_roles] = unit_contents
                unit_versions.push(sliced)
              end

              input.update(indexed_unit_versions: unit_versions)
              output.update(indexed_unit_versions: unit_versions)
            end

            def finalize
              # rubocop:disable Layout/LineLength

              unit_variables = input[:extract_variables_action_output][:extract_variables_response]

              unit_revision = ::ForemanAnsibleDirector::ContentService.create_content_unit_revision(
                cuv_id: input[:unit_version_id],
                git_ref: input[:git_ref],
                latest_version_href: input[:repository_show_action_output][:repository_show_response][:latest_version_href],
                pulp_repository_href: input[:repository_href],
                pulp_remote_href: input[:remote_href],
                pulp_distribution_href: input[:distribution_href]
              )

              raise if input[:indexed_unit_versions].length > 1

              version = input[:indexed_unit_versions][0]

              version[:collection_roles].each do |collection_role|
                collection_role_record = ::ForemanAnsibleDirector::ContentService.create_collection_role_for_revision(
                  revision: unit_revision,
                  name: collection_role
                )

                cr_variables = unit_variables[version[:version]][collection_role]
                next if cr_variables.nil?

                ActiveRecord::Base.transaction do
                  cr_variables.each do |variable_name, variable_value|
                    create = ::ForemanAnsibleDirector::Structs::AnsibleVariable::AnsibleVariableCreate.new(
                      variable_name, 'yaml',
                      variable_value
                    ) # TODO: Guess data-type
                    ::ForemanAnsibleDirector::VariableService.create_variable(create, collection_role_record)
                  end
                end
              end

              ::ForemanAnsibleDirector::ContentService.create_revision_activator(
                consumable_id: input[:activator_id],
                consumable_type: input[:activator_type],
                revision_id: unit_revision.id
              )

              # rubocop:enable Layout/LineLength
            end
          end
        end
      end
    end
  end
end
