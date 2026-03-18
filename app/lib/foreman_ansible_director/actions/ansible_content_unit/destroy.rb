# frozen_string_literal: true

module ForemanAnsibleDirector
  module Actions
    module AnsibleContentUnit
      class Destroy < ::ForemanAnsibleDirector::Actions::Base::AnsibleDirectorAction
        input_format do
          param :unit
          param :content_unit_id
          param :organization_id
        end

        def plan(args)
          unit = args[:unit]
          content_unit_id = args[:content_unit_id]

          if !unit.versions.empty?
            plan_partial_destroy(unit, content_unit_id)
          else
            plan_full_destroy(content_unit_id)
          end
          plan_self(
            content_unit_id: content_unit_id,
            unit_type: unit.unit_type,
            unit_versions: unit.versions
          )
        end

        def finalize
          acu = ::ForemanAnsibleDirector::ContentUnit.find_by(
            id: input[:content_unit_id]
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

        def plan_full_destroy(content_unit_id)
          acu = ::ForemanAnsibleDirector::ContentUnit.find_by(id: content_unit_id)

          unique_remotes = Set[]
          unique_repositories = Set[]
          unique_distributions = Set[]

          acu.content_unit_versions.each do |version|
            unique_remotes.add(version.pulp_remote_href)
            unique_repositories.add(version.pulp_repository_href)
            unique_distributions.add(version.pulp_distribution_href)
          end

          unique_remotes = unique_remotes.to_a
          unique_repositories = unique_repositories.to_a
          unique_distributions = unique_distributions.to_a

          # unique_* all have the same length, neither of these objects can be created without the other ones
          concurrence do
            unique_remotes.length.times do |n|
              plan_action(::ForemanAnsibleDirector::Actions::Pulp3::Ansible::Repository::Destroy,
                repository_href: unique_repositories[n])
              plan_action(::ForemanAnsibleDirector::Actions::Pulp3::Ansible::Distribution::Destroy,
                distribution_href: unique_distributions[n])

              if acu.collection?
                plan_action(::ForemanAnsibleDirector::Actions::Pulp3::Ansible::Remote::Collection::Destroy,
                  collection_remote_href: unique_remotes[n])
              else
                plan_action(::ForemanAnsibleDirector::Actions::Pulp3::Ansible::Remote::Role::Destroy,
                  role_remote_href: unique_remotes[n])
              end
            end
          end
        end

        def plan_partial_destroy(unit, content_unit_id)
          acu = ::ForemanAnsibleDirector::AnsibleCollection.find_by(id: content_unit_id) # Only collections

          repository_href = acu.content_unit_versions.first.pulp_repository_href
          remote_href = acu.content_unit_versions.first.pulp_remote_href

          sequence do
            _remote_update_action = plan_action(
              ::ForemanAnsibleDirector::Actions::Pulp3::Ansible::Remote::Collection::Update,
              collection_remote_href: remote_href,
              requirements: acu.requirements_file(unit, subtractive: true)
            )
            _snyc_action = plan_action(
              ::ForemanAnsibleDirector::Actions::Pulp3::Ansible::Repository::Sync,
              repository_href: repository_href,
              remote_href: remote_href
            )
          end
        end
      end
    end
  end
end
