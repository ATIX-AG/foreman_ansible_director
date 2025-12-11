# frozen_string_literal: true

module ForemanAnsibleDirector
  module Actions
    module AnsibleContentUnit
      class Import < ::ForemanAnsibleDirector::Actions::Base::AnsibleDirectorAction
        input_format do
          param :unit, Object, required: true # SimpleAnsibleContentUnit
          param :organization_id, required: true
        end

        def plan(args)
          unit = args[:unit]
          organization_id = args[:organization_id]
          op_type = operation_type unit

          case op_type
          when :import
            plan_import(unit, organization_id)
          when :update
            plan_update(unit, organization_id)
          end
        end

        private

        def plan_import(unit, organization_id)
          sequence do
            repository_create_action = plan_action(
              ::ForemanAnsibleDirector::Actions::Pulp3::Ansible::Repository::Create,
              name: "#{organization_id}-#{unit.name}"
            )

            distribution_create_action = plan_action(
              ::ForemanAnsibleDirector::Actions::Pulp3::Ansible::Distribution::Create,
              name: unit.name,
              base_path: "#{organization_id}/#{unit.name}",
              repository_href: repository_create_action.output['repository_create_response']['pulp_href']
            )

            case unit.unit_type
            when :collection
              # rubocop:disable Lint/LiteralAsCondition
              if false
                # TODO: OR-5511 - Git support
              else
                collection_remote_create_action = plan_action(
                  ::ForemanAnsibleDirector::Actions::Pulp3::Ansible::Remote::Collection::Create,
                  name: "#{organization_id}-#{unit.name}",
                  url: unit.source,
                  requirements: unit.collection_file
                )

                remote_href = collection_remote_create_action.output['collection_remote_create_response']['pulp_href']
              end

              _snyc_action = plan_action(
                ::ForemanAnsibleDirector::Actions::Pulp3::Ansible::Repository::Sync,
                repository_href: repository_create_action.output['repository_create_response']['pulp_href'],
                remote_href: remote_href
              )
              # rubocop:enable Lint/LiteralAsCondition
            when :role
              # rubocop:disable Lint/LiteralAsCondition
              if false
                # TODO: Git support: OR-5511
              else
                role_remote_create_action = plan_action(
                  ::ForemanAnsibleDirector::Actions::Pulp3::Ansible::Remote::Role::Create,
                  name: "#{organization_id}-#{unit.name}",
                  url: unit.role_url
                )

                remote_href = role_remote_create_action.output['role_remote_create_response']['pulp_href']

                _snyc_action = plan_action(
                  ::ForemanAnsibleDirector::Actions::Pulp3::Ansible::Repository::Sync,
                  repository_href: repository_create_action.output['repository_create_response']['pulp_href'],
                  remote_href: remote_href
                )
              end
              # rubocop:enable Lint/LiteralAsCondition

            end

            _index_action = plan_action(
              Index,
              index_mode: 'import',
              repository_href: repository_create_action.output['repository_create_response']['pulp_href'],
              remote_href: remote_href,
              distribution_href: distribution_create_action.output['distribution_create_response']['pulp_href'],
              content_unit_type: unit.unit_type,
              content_unit_source: unit.source,
              unit_name: unit.unit_name,
              unit_namespace: unit.unit_namespace,
              organization_id: organization_id
            )
          end
        end

        def plan_update(scu, organization_id)
          existing_unit = ::ForemanAnsibleDirector::AnsibleCollection.find_by(
            namespace: scu.unit_namespace,
            name: scu.unit_name,
            organization_id: organization_id
          )

          repository_href = existing_unit.pulp_repository_href
          remote_href = existing_unit.pulp_remote_href
          distribution_href = existing_unit.pulp_distribution_href

          sequence do
            _remote_update_action = plan_action(
              ::ForemanAnsibleDirector::Actions::Pulp3::Ansible::Remote::Collection::Update,
              collection_remote_href: remote_href,
              requirements: existing_unit.requirements_file(scu)
            )

            _snyc_action = plan_action(
              ::ForemanAnsibleDirector::Actions::Pulp3::Ansible::Repository::Sync,
              repository_href: repository_href,
              remote_href: remote_href
            )

            _index_action = plan_action(
              Index,
              index_mode: 'update',
              repository_href: repository_href,
              remote_href: remote_href,
              distribution_href: distribution_href,
              content_unit_type: scu.unit_type,
              content_unit_source: scu.source,
              unit_name: scu.unit_name,
              unit_namespace: scu.unit_namespace,
              organization_id: organization_id
            )
          end
        end

        # Helper method to decide the operation type:
        # e = Unit exists; v = Unit.version exists; s = Force override
        # | e | v | s | operation |
        # | 0 | 0 | 0 | :import |
        # | 0 | 0 | 1 | :import |
        # | 0 | 1 | 0 | INVALID |
        # | 0 | 1 | 1 | INVALID |
        # | 1 | 0 | 0 | :update |
        # | 1 | 0 | 1 | :update |
        # | 1 | 1 | 0 | NOOP    |
        # | 1 | 1 | 1 | :update |
        # TODO: Unit test this
        def operation_type(unit)
          force_override = Setting[:ad_content_import_override]

          existing_unit = ::ForemanAnsibleDirector::ContentUnit.find_by(namespace: unit.unit_namespace,
            name: unit.unit_name)
          return :import unless existing_unit

          existing_unit_versions = existing_unit.content_unit_versions.select do |x|
            unit.versions.include? x.version
          end

          return :noop if !existing_unit_versions.empty? && !force_override
          :update
        end
      end
    end
  end
end
