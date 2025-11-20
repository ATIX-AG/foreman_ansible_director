# frozen_string_literal: true

module ForemanAnsibleDirector
  module Actions
    module AnsibleContentUnit
      class Index < ::ForemanAnsibleDirector::Actions::Base::AnsibleDirectorAction
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
              ::ForemanAnsibleDirector::Actions::Pulp3::Ansible::Repository::Show,
              repository_href: args[:repository_href]
            )
            if args[:content_unit_type] == :collection
              list_action = plan_action(
                ::ForemanAnsibleDirector::Actions::Pulp3::Ansible::Content::Collection::List,
                repository_version_href: repository_show_action.output[:repository_show_response][:latest_version_href]
              )
            else
              list_action = plan_action(
                ::ForemanAnsibleDirector::Actions::Pulp3::Ansible::Content::Role::List,
                repository_version_href: repository_show_action.output[:repository_show_response][:latest_version_href]
              )
            end

            extract_variables_action = plan_action(::ForemanAnsibleDirector::Actions::AnsibleContentUnit::ExtractVariables,
                                                    repository_show_action_output: repository_show_action.output,
                                                    list_action_output: list_action.output,
                                                    organization_id: args[:organization_id],
                                                    unit_name: args[:unit_name],
                                                    unit_namespace: args[:unit_namespace])

            plan_self(
              args.merge(
                list_action_output: list_action.output,
                repository_show_action_output: repository_show_action.output,
                extract_variables_action_output: extract_variables_action.output,
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
          output.update(indexed_unit_versions: unit_versions)
        end

        def finalize
          # rubocop:disable Layout/LineLength
          unit_versions = input[:indexed_unit_versions]
          unit_variables = input[:extract_variables_action_output][:extract_variables_response]

          case input[:index_mode]
          when 'import'

            if input[:content_unit_type] == 'collection'
              unit_record = ::ForemanAnsibleDirector::AnsibleCollection.create!(
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
              unit_record = ::ForemanAnsibleDirector::AnsibleRole.new(
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
              content_unit_version = ::ForemanAnsibleDirector::ContentUnitVersion.create!(
                versionable: unit_record,
                version: version[:version],
                versionable_type: unit_record.class.to_s
              )

              next unless unit_record.is_a?(::ForemanAnsibleDirector::AnsibleCollection)

              version[:collection_roles].each do |collection_role|
                collection_role_record = content_unit_version.ansible_collection_roles.create!(
                  name: collection_role
                )

                cr_variables = unit_variables[version[:version]][collection_role]
                unless cr_variables.nil?

                  ActiveRecord::Base.transaction do
                    cr_variables.each do |variable_name, variable_value|
                      create = ::ForemanAnsibleDirector::Structs::AnsibleVariable::AnsibleVariableCreate.new(variable_name, "yaml", variable_value) # TODO: Guess data-type
                      ::ForemanAnsibleDirector::VariableService.create_variable(create, collection_role_record)
                    end
                  end
                end
              end
            end

          when 'update'

            existing_unit = ::ForemanAnsibleDirector::AnsibleCollection.find_by(pulp_repository_href: input[:repository_href])
            existing_unit_versions = existing_unit.content_unit_versions.pluck(:version)

            existing_unit.update(latest_version_href: input[:repository_show_action_output][:repository_show_response][:latest_version_href])

            new_unit_versions = unit_versions.reject do |unit_version|
              existing_unit_versions.include?(unit_version[:version])
            end

            new_unit_versions.each do |new_version|


              content_unit_version = ::ForemanAnsibleDirector::ContentUnitVersion.create!(
                versionable: existing_unit,
                version: new_version[:version],
                versionable_type: existing_unit.class.to_s
              )

              new_version[:collection_roles].each do |collection_role|
                collection_role_record = content_unit_version.ansible_collection_roles.create!(
                  name: collection_role
                )

                cr_variables = unit_variables[new_version[:version]][collection_role]
                unless cr_variables.nil?

                  ActiveRecord::Base.transaction do
                    cr_variables.each do |variable_name, variable_value|
                      create = ::ForemanAnsibleDirector::Structs::AnsibleVariable::AnsibleVariableCreate.new(variable_name, "yaml", variable_value) # TODO: Guess data-type
                      ::ForemanAnsibleDirector::VariableService.create_variable(create, collection_role_record)
                    end
                  end
                end
              end

            end
          end
          # rubocop:enable Layout/LineLength
        end
      end
    end
  end
end
