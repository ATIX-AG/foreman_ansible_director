# frozen_string_literal: true

module ForemanAnsibleDirector
  module Actions
    module AnsibleContentUnit
      module Index
        class IndexStatic < ::ForemanAnsibleDirector::Actions::Base::AnsibleDirectorAction
          input_format do
            param :repository_href, String, required: true
            param :content_unit_type, Symbol, required: true
            param :unit_name, String, required: true
            param :unit_namespace, String, required: true
            param :organization_id, Integer, required: true
            param :skip, Boolean, required: false
          end

          output_format do
            param :index_content_response, Hash
          end

          def plan(args)
            sequence do
              repository_show_action = plan_action(
                ::ForemanAnsibleDirector::Actions::Pulp3::Ansible::Repository::Show,
                repository_href: args[:repository_href],
                skip: args[:skip]
              )
              list_action = if args[:content_unit_type] == :collection
                              plan_action(
                                ::ForemanAnsibleDirector::Actions::Pulp3::Ansible::Content::Collection::List,
                                repository_version_href:
                                  repository_show_action.output[:repository_show_response][:latest_version_href],
                                skip: args[:skip]
                              )
                            else
                              plan_action(
                                ::ForemanAnsibleDirector::Actions::Pulp3::Ansible::Content::Role::List,
                                repository_version_href:
                                  repository_show_action.output[:repository_show_response][:latest_version_href],
                                skip: args[:skip]
                              )
                            end

              extract_variables_action = plan_action(
                ::ForemanAnsibleDirector::Actions::AnsibleContentUnit::ExtractVariables,
                repository_show_action_output: repository_show_action.output,
                list_action_output: list_action.output,
                organization_id: args[:organization_id],
                unit_name: args[:unit_name],
                unit_namespace: args[:unit_namespace],
                unit_name_suffix: 'galaxy',
                skip: args[:skip]
              )

              plan_self(
                args.merge(
                  list_action_output: list_action.output,
                  repository_show_action_output: repository_show_action.output,
                  extract_variables_action_output: extract_variables_action.output,
                  skip: args[:skip]
                )
              )
            end
          end

          def run
            return if input[:skip]

            unit_versions = []

            # COMPAT: 3.16 - 1
            # The pulp_ansible version used in 3.16 is not consistent in the responses of certain API calls
            # with the version used in 3.18.
            # Notably, the "contents" key is not in the response, causing this code to fail.
            # As a workaround, the version identifiers gathered during variable extraction can be used.
            # This is suboptimal, as the cross referencing done below is meaningless.
            # ------
            # imported_versions = input.dig(:list_action_output, :repository_artifacts, :results)

            # raise unless imported_versions
            # imported_versions.each do |result|
            #  sliced = result.slice(:artifact, :version, :sha256)
            #  if input[:content_unit_type] == 'collection'
            #    unit_contents = result.slice(:contents)
            #    unit_contents = unit_contents[:contents].select { |cu| cu['content_type'] == 'role' }
            #    unit_contents = unit_contents.map { |cu| cu['name'] }
            #    sliced[:collection_roles] = unit_contents
            #  end
            #  unit_versions.push(sliced)
            # end

            input.dig(:extract_variables_action_output, :extract_variables_response).each do |version, roles|
              unit_versions << {
                version: version,
                collection_roles: roles.keys,
              }
            end

            input.update(indexed_unit_versions: unit_versions)
            output.update(indexed_unit_versions: unit_versions)
          end

          def finalize
            return if input[:skip]
            unit_versions = input[:indexed_unit_versions]
            unit_variables = input[:extract_variables_action_output][:extract_variables_response]

            case input[:index_mode]
            when 'import'

              unit_record = ::ForemanAnsibleDirector::AnsibleCollection.find_by(name: input[:unit_name],
                namespace: input[:unit_namespace],
                organization_id: input[:organization_id])

              unit_record ||= if input[:content_unit_type] == 'collection'
                                ::ForemanAnsibleDirector::ContentService.create_ansible_collection(
                                  name: input[:unit_name],
                                  namespace: input[:unit_namespace],
                                  organization_id: input[:organization_id]
                                )
                              else
                                # Make intellisense shut up - input[:content_unit_type] == 'role'
                                ::ForemanAnsibleDirector::ContentService.create_ansible_role(
                                  name: input[:unit_name],
                                  namespace: input[:unit_namespace],
                                  organization_id: input[:organization_id]
                                )
                              end

              unit_versions.each do |version|
                content_unit_version = ::ForemanAnsibleDirector::ContentService.create_ansible_content_unit_version(
                  versionable: unit_record,
                  version: version[:version],
                  source: input[:content_unit_source],
                  source_type: 'galaxy',
                  latest_version_href:
                    input[:repository_show_action_output][:repository_show_response][:latest_version_href],
                  pulp_repository_href: input[:repository_href],
                  pulp_remote_href: input[:remote_href],
                  pulp_distribution_href: input[:distribution_href]
                )

                next unless unit_record.is_a?(::ForemanAnsibleDirector::AnsibleCollection)

                version[:collection_roles].each do |collection_role|
                  collection_role_record = content_unit_version.ansible_collection_roles.create!(
                    name: collection_role
                  )

                  cr_variables = unit_variables[version[:version]][collection_role]
                  next if cr_variables.nil?

                  ActiveRecord::Base.transaction do
                    cr_variables.each do |variable_name, variable|
                      ::ForemanAnsibleDirector::VariableService.create_variable(
                        key: variable_name,
                        type: variable[:type],
                        default_value: variable[:value],
                        owner: collection_role_record
                      )
                    end
                  end
                end
              end

            when 'update'

              existing_unit = ::ForemanAnsibleDirector::AnsibleCollection.find_by(id: input[:content_unit_id])

              existing_unit_versions = []

              existing_unit.content_unit_versions.each do |unit_version_record|
                existing_unit_versions.push(unit_version_record.version)
                unit_version_record.update(
                  latest_version_href:
                    input[:repository_show_action_output][:repository_show_response][:latest_version_href]
                )
              end

              new_unit_versions = unit_versions.reject do |unit_version|
                existing_unit_versions.include?(unit_version[:version])
              end

              source = existing_unit.content_unit_versions.first.source
              repository_href = existing_unit.content_unit_versions.first.pulp_repository_href
              remote_href = existing_unit.content_unit_versions.first.pulp_remote_href
              distribution_href = existing_unit.content_unit_versions.first.pulp_distribution_href

              new_unit_versions.each do |new_version|
                collection_version = ::ForemanAnsibleDirector::ContentService.create_ansible_content_unit_version(
                  versionable: existing_unit,
                  source: source,
                  source_type: 'galaxy',
                  latest_version_href:
                    input[:repository_show_action_output][:repository_show_response][:latest_version_href],
                  pulp_repository_href: repository_href,
                  pulp_distribution_href: distribution_href,
                  pulp_remote_href: remote_href,
                  version: new_version[:version],
                  dynamic: false
                )

                new_version[:collection_roles].each do |collection_role|
                  collection_role_record = ::ForemanAnsibleDirector::ContentService.create_collection_role(
                    collection: collection_version,
                    name: collection_role
                  )

                  cr_variables = unit_variables[new_version[:version]][collection_role]
                  next if cr_variables.nil?

                  ActiveRecord::Base.transaction do
                    cr_variables.each do |variable_name, variable_value|
                      ::ForemanAnsibleDirector::VariableService.create_variable(
                        key: variable_name,
                        type: variable[:type],
                        default_value: variable_value,
                        owner: collection_role_record
                      )
                    end
                  end
                end
              end
            else
              raise NotImplementedError
            end
          end
        end
      end
    end
  end
end
