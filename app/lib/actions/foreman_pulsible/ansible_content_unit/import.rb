module Actions
  module ForemanPulsible
    module AnsibleContentUnit
      class Import < ::Actions::ForemanPulsible::Base::PulsibleAction

        input_format do
          param :parsed_content_unit, Object, required: true
        end

        def plan(args)
          pcu = args[:parsed_content_unit]

          sequence do
            repository_create_action = plan_action(
              ::Actions::ForemanPulsible::Pulp3::Ansible::Repository::Create,
              name: pcu.name
            )

            _distribution_create_action = plan_action(
              ::Actions::ForemanPulsible::Pulp3::Ansible::Distribution::Create,
              name: pcu.name,
              base_path: "pulsible",
              repository_href: repository_create_action.output['repository_create_response']['pulp_href']
            )

            case pcu.unit_type
            when :collection
              # TODO: This configuration does not work. Fix as OR-5511
              if pcu.git?
                collection_remote_create_action = plan_action(
                  ::Actions::ForemanPulsible::Pulp3::Ansible::Remote::Git::Create,
                  name: pcu.name,
                  url: pcu.source,
                  git_ref: pcu.version
                )
              else
                collection_remote_create_action = plan_action(
                  ::Actions::ForemanPulsible::Pulp3::Ansible::Remote::Collection::Create,
                  name: pcu.name,
                  url: pcu.source,
                  requirements: pcu.collection_file
                )
              end

              _snyc_action = plan_action(
                ::Actions::ForemanPulsible::Pulp3::Ansible::Repository::Sync,
                repository_href: repository_create_action.output['repository_create_response']['pulp_href'],
                remote_href: collection_remote_create_action.output['collection_remote_create_response']['pulp_href'],
              )

            when :role
              if pcu.git?
                # TODO: Git support: OR-5511
              else
                role_remote_create_action = plan_action(
                  ::Actions::ForemanPulsible::Pulp3::Ansible::Remote::Role::Create,
                  name: pcu.name,
                  url: pcu.role_url
                )

                _snyc_action = plan_action(
                  ::Actions::ForemanPulsible::Pulp3::Ansible::Repository::Sync,
                  repository_href: repository_create_action.output['repository_create_response']['pulp_href'],
                  remote_href: role_remote_create_action.output['role_remote_create_response']['pulp_href'],
                )
              end

            else
              # TODO: Handle invalid PCU
            end

          end
        end
      end
    end
  end
end
