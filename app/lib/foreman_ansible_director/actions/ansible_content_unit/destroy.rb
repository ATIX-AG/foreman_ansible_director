# frozen_string_literal: true

module ForemanAnsibleDirector
  module Actions
    module AnsibleContentUnit
      class Destroy < ::ForemanAnsibleDirector::Actions::Base::AnsibleDirectorAction
        input_format do
          param :unit_id
          param :unit_version_ids # {git: [], galaxy: []}
          param :complete, Boolean
        end

        def plan(args)
          unit_id = args[:unit_id]
          unit_version_ids = args[:unit_version_ids]

          complete = args[:complete]

          if complete
            plan_full_destroy(unit_id)
            plan_self(
              unit_id: unit_id
            )
          else
            plan_partial_destroy(unit_id, unit_version_ids)
          end
        end

        def finalize
          acu = ::ForemanAnsibleDirector::ContentUnit.find_by(
            id: input[:unit_id]
          )
          acu&.destroy
        end

        private

        # I am disabling the guard-clause rule here, because I don't think it makes a lot of sense in this case.
        # galaxy_cuvs and git_cuvs are independent of each other, so early returning is not possible.
        # rubocop: disable Style/GuardClause
        def plan_full_destroy(unit_id)
          galaxy_cuvs = ::ForemanAnsibleDirector::ContentUnit
                        .find_by(id: unit_id)
                        .content_unit_versions
                        .where(source_type: 'galaxy')

          git_cuvs = ::ForemanAnsibleDirector::ContentUnit
                     .find_by(id: unit_id)
                     .content_unit_versions
                     .where(source_type: 'git')

          unless galaxy_cuvs.empty?
            plan_action(::ForemanAnsibleDirector::Actions::AnsibleContentUnit::DestroyProviders::Galaxy::DestroyFull,
              unit_id: unit_id,
              unit_version_ids: galaxy_cuvs)
          end

          unless git_cuvs.empty?
            git_cuvs.each do |git_cuv|
              plan_action(::ForemanAnsibleDirector::Actions::AnsibleContentUnit::DestroyProviders::Git::DestroyFull,
                unit_id: unit_id,
                unit_version_id: git_cuv)
            end
          end
        end
        # rubocop: enable Style/GuardClause

        # Same as above
        # rubocop: disable Style/GuardClause
        def plan_partial_destroy(unit_id, unit_version_ids)
          galaxy_cuvs = unit_version_ids[:galaxy]
          git_cuvs = unit_version_ids[:git]

          unless galaxy_cuvs.empty?
            plan_action(::ForemanAnsibleDirector::Actions::AnsibleContentUnit::DestroyProviders::Galaxy::DestroyPartial,
              unit_id: unit_id,
              unit_version_ids: galaxy_cuvs)
          end

          unless git_cuvs.empty?
            git_cuvs.each do |git_cuv|
              plan_action(::ForemanAnsibleDirector::Actions::AnsibleContentUnit::DestroyProviders::Git::DestroyPartial,
                unit_id: unit_id,
                unit_version_id: git_cuv)
            end

          end
        end
        # rubocop: enable Style/GuardClause
      end
    end
  end
end
