# frozen_string_literal: true

module ForemanAnsibleDirector
  module Actions
    module AnsibleContentUnit
      module ImportProviders
        module Git
          module DynamicRef
            class ImportCollection < ::ForemanAnsibleDirector::Actions::Base::AnsibleDirectorAction
              input_format do
                param :git_url, String, required: true
                param :git_ref, String, required: true
                param :unit_name, String, required: true
                param :unit_type, String, required: true
                param :unit_version_id, String, required: true
                param :organization_id, String, required: true
                param :activator_type, String, required: true
                param :activator_id, String, required: true
              end

              def plan(args)
                sequence do
                  organization_id = args[:organization_id]
                  unit_name = args[:unit_name]

                  git_ls_remote_action = plan_action(
                    ::ForemanAnsibleDirector::Actions::GitOps::LsRemote,
                    git_remote: args[:git_url]
                  )

                  top_commit = plan_self(
                    git_ls_remote: git_ls_remote_action.output,
                    reference: args[:git_ref]
                  ).output[:top_commit]

                  repository_create_action = plan_action(
                    ::ForemanAnsibleDirector::Actions::Pulp3::Ansible::Repository::Create,
                    name: "#{organization_id}-git-#{unit_name}",
                    name_suffix: top_commit,
                    skip: false
                  )

                  distribution_create_action = plan_action(
                    ::ForemanAnsibleDirector::Actions::Pulp3::Ansible::Distribution::Create,
                    name: "#{organization_id}-git-#{unit_name}",
                    name_suffix: top_commit,
                    path_suffix: top_commit,
                    base_path: "#{organization_id}/#{unit_name}",
                    repository_href: repository_create_action.output['repository_create_response']['pulp_href'],
                    skip: false
                  )

                  git_remote_create_action = plan_action(
                    ::ForemanAnsibleDirector::Actions::Pulp3::Ansible::Remote::Git::Create,
                    name: "#{organization_id}-git-#{unit_name}",
                    name_suffix: top_commit,
                    url: args[:git_url],
                    git_ref: top_commit,
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
                    ::ForemanAnsibleDirector::Actions::AnsibleContentUnit::Index::Dynamic::IndexGitCollection,
                    git_ref: top_commit,
                    repository_href: repository_create_action.output['repository_create_response']['pulp_href'],
                    remote_href: remote_href,
                    distribution_href: distribution_create_action.output['distribution_create_response']['pulp_href'],
                    unit_name: 'admin',
                    unit_namespace: 'nextcloud',
                    unit_version_id: args[:unit_version_id],
                    organization_id: organization_id,
                    activator_type: args[:activator_type],
                    activator_id: args[:activator_id]
                  )
                end
              end

              def run
                branches = input.dig(:git_ls_remote, :git_ls_remote, :branches)
                pulls = input.dig(:git_ls_remote, :git_ls_remote, :pull)

                reference = input[:reference]

                output.update(top_commit: (branches[reference] || pulls[reference])[:sha][0, 8])
              end
            end
          end
        end
      end
    end
  end
end
