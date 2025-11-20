# frozen_string_literal: true

module ForemanAnsibleDirector
  module Actions
    module AnsibleContentUnit
      class Destroy < ::ForemanAnsibleDirector::Actions::Base::AnsibleDirectorAction
        input_format do
          param :unit
          param :organization_id
        end

        def plan(args)
          unit = args[:unit]
          organization_id = args[:organization_id]

          if !unit.versions.empty?
            plan_partial_destroy(unit, organization_id)
          else
            plan_full_destroy(unit, organization_id)
          end
          plan_self(
            organization_id: organization_id,
            unit_name: unit.unit_name,
            unit_namespace: unit.unit_namespace,
            unit_type: unit.unit_type,
            unit_versions: unit.versions
          )
        end

        def finalize
          acu = ::ForemanAnsibleDirector::ContentUnit.find_by(
            name: input[:unit_name],
            namespace: input[:unit_namespace],
            organization_id: input[:organization_id]
          )
          if input[:unit_type] == 'collection'
            if !input[:unit_versions].empty? # partial
              input[:unit_versions].each do |version|
                acu&.content_unit_versions&.find_by(version: version)&.destroy
              end
            else
              acu&.destroy
            end
          else
            acu&.destroy
          end
        end

        private

        # rubocop:disable Layout/LineLength
        def plan_full_destroy(unit, organization_id)
          acu = ::ForemanAnsibleDirector::ContentUnit.find_by(name: unit.unit_name, namespace: unit.unit_namespace, organization_id: organization_id) # find_unit

          concurrence do
            plan_action(::ForemanAnsibleDirector::Actions::Pulp3::Ansible::Repository::Destroy,
              repository_href: acu.pulp_repository_href)
            plan_action(::ForemanAnsibleDirector::Actions::Pulp3::Ansible::Distribution::Destroy,
              distribution_href: acu.pulp_distribution_href)

            if acu.collection?
              plan_action(::ForemanAnsibleDirector::Actions::Pulp3::Ansible::Remote::Collection::Destroy,
                collection_remote_href: acu.pulp_remote_href)
            else
              plan_action(::ForemanAnsibleDirector::Actions::Pulp3::Ansible::Remote::Role::Destroy,
                role_remote_href: acu.pulp_remote_href)
            end
          end
        end

        def plan_partial_destroy(unit, organization_id)
          acu = ::ForemanAnsibleDirector::AnsibleCollection.find_by(name: unit.unit_name, namespace: unit.unit_namespace, organization_id: organization_id) # Only collections

          sequence do
            _remote_update_action = plan_action(::ForemanAnsibleDirector::Actions::Pulp3::Ansible::Remote::Collection::Update,
              collection_remote_href: acu.pulp_remote_href,
              requirements: acu.requirements_file(unit, subtractive: true))
            _snyc_action = plan_action(
              ::ForemanAnsibleDirector::Actions::Pulp3::Ansible::Repository::Sync,
              repository_href: acu.pulp_repository_href,
              remote_href: acu.pulp_remote_href
            )
          end
        end
        # rubocop:enable Layout/LineLength
      end
    end
  end
end
