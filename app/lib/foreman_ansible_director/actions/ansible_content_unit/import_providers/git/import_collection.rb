# frozen_string_literal: true

module ForemanAnsibleDirector
  module Actions
    module AnsibleContentUnit
      module ImportProviders
        module Git
          class ImportCollection < ::ForemanAnsibleDirector::Actions::Base::AnsibleDirectorAction
            input_format do
              param :unit, Object, required: true # SimpleAnsibleContentUnit
              param :unit_version, String, required: true
              param :git_ls_remote, Hash, required: true
              param :organization_id, required: true
            end

            def plan(args)
              unit = args[:unit]
              organization_id = args[:organization_id]
              unit_version = args[:unit_version]

              obj_name_suffix = Base64.encode64(args[:unit_version][0, 16]).strip

              git_check = plan_self(git_ls_remote: args[:git_ls_remote],
                reference: unit_version)

              dynamic_reference = git_check.output['dynamic_reference']
              ref = git_check.output['reference']

              repository_create_action = plan_action(
                ::ForemanAnsibleDirector::Actions::Pulp3::Ansible::Repository::Create,
                name: "#{organization_id}-git-#{unit.name}",
                name_suffix: obj_name_suffix,
                skip: false
              )

              distribution_create_action = plan_action(
                ::ForemanAnsibleDirector::Actions::Pulp3::Ansible::Distribution::Create,
                name: "#{organization_id}-git-#{unit.name}",
                name_suffix: obj_name_suffix,
                base_path: "#{organization_id}/#{unit.name}-git",
                path_suffix: obj_name_suffix,
                repository_href: repository_create_action.output['repository_create_response']['pulp_href'],
                skip: false
              )

              git_remote_create_action = plan_action(
                ::ForemanAnsibleDirector::Actions::Pulp3::Ansible::Remote::Git::Create,
                name: "#{organization_id}-git-#{unit.name}",
                name_suffix: obj_name_suffix,
                url: unit.source,
                git_ref: ref,
                skip: false
              )

              remote_href = git_remote_create_action.output['git_remote_create_response']['pulp_href']

              _snyc_action = plan_action(
                ::ForemanAnsibleDirector::Actions::Pulp3::Ansible::Repository::Sync,
                repository_href: repository_create_action.output['repository_create_response']['pulp_href'],
                remote_href: remote_href,
                skip: false
              )

              _index_action = plan_action(
                ::ForemanAnsibleDirector::Actions::AnsibleContentUnit::Index::IndexGitCollection,
                index_mode: 'import',
                unit_version: unit_version,
                unit_name: unit.unit_name,
                unit_namespace: unit.unit_namespace,
                unit_source: unit.source,
                unit_source_type: unit.source_type,
                unit_name_suffix: obj_name_suffix,
                repository_href: repository_create_action.output['repository_create_response']['pulp_href'],
                remote_href: remote_href,
                distribution_href: distribution_create_action.output['distribution_create_response']['pulp_href'],
                dynamic_reference: dynamic_reference,
                organization_id: organization_id
              )
            end

            def run
              # TODO: Also check whether the reference exists at all. Raise and skip if not
              branches = input.dig(:git_ls_remote, :git_ls_remote, :branches)
              pulls = input.dig(:git_ls_remote, :git_ls_remote, :pull)
              tags = input.dig(:git_ls_remote, :git_ls_remote, :tags)

              reference = input[:reference]

              dynamic = branches&.keys&.include?(reference) ||
                        pulls&.keys&.include?(reference)

              if dynamic
                ref = (branches[reference] || pulls[reference])[:sha][0, 8]
              else
                begin
                  ref = (tags[reference])[:sha][0, 8]
                rescue NoMethodError # ref is a commit literal
                  ref = reference
                end
              end

              output.update(dynamic_reference: dynamic)
              output.update(reference: ref)
            end
          end
        end
      end
    end
  end
end
