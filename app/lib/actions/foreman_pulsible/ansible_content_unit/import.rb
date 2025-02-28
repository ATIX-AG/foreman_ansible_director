module Actions
  module ForemanPulsible
    module AnsibleContentUnit
      class Import < ::Actions::ForemanPulsible::Base::PulsibleAction

        input_format do
          param :parsed_content_unit, Object, required: true
        end

        def plan(args)
          pcu = args[:parsed_content_unit]
          op_type = operation_type pcu

          if op_type == :import
            plan_import(pcu)
          elsif op_type == :update
            plan_update(pcu)
          end
        end

        private

        def plan_import(pcu)
          sequence do
            repository_create_action = plan_action(
              ::Actions::ForemanPulsible::Pulp3::Ansible::Repository::Create,
              name: pcu.name
            )

            distribution_create_action = plan_action(
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

                remote_href = collection_remote_create_action.output['collection_remote_create_response']['pulp_href']
              end

              _snyc_action = plan_action(
                ::Actions::ForemanPulsible::Pulp3::Ansible::Repository::Sync,
                repository_href: repository_create_action.output['repository_create_response']['pulp_href'],
                remote_href: remote_href,
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

                remote_href = role_remote_create_action.output['role_remote_create_response']['pulp_href']

                _snyc_action = plan_action(
                  ::Actions::ForemanPulsible::Pulp3::Ansible::Repository::Sync,
                  repository_href: repository_create_action.output['repository_create_response']['pulp_href'],
                  remote_href: remote_href,
                )
              end

            else
              # TODO: Handle invalid PCU
            end

            _index_action = plan_action(
              Index,
              index_mode: "import",
              repository_href: repository_create_action.output['repository_create_response']['pulp_href'],
              remote_href: remote_href,
              distribution_href: distribution_create_action.output['distribution_create_response']['pulp_href'],
              content_unit_type: pcu.unit_type,
              content_unit_source: pcu.source,
            )

          end
        end

        def plan_update(pcu)
          existing_unit = AnsibleCollection.find_by(namespace: pcu.unit_namespace, name: pcu.unit_name)

          repository_href = existing_unit.pulp_repository_href
          remote_href = existing_unit.pulp_remote_href
          distribution_href = existing_unit.pulp_distribution_href


          if pcu.unit_type == :collection
            sequence do
            _remote_update_action = plan_action(::Actions::ForemanPulsible::Pulp3::Ansible::Remote::Collection::Update,
                        collection_remote_href: remote_href,
                        requirements: existing_unit.requirements_file(pcu))

            _snyc_action = plan_action(
                  ::Actions::ForemanPulsible::Pulp3::Ansible::Repository::Sync,
                  repository_href: repository_href,
                  remote_href: remote_href,
              )

            _index_action = plan_action(
              Index,
              index_mode: "update",
              repository_href: repository_href,
              remote_href: remote_href,
              distribution_href: distribution_href,
              content_unit_type: pcu.unit_type,
              content_unit_source: pcu.source,
            )
            end
          else
            # TODO: Role support
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
        def operation_type(pcu)

          force_override = false # TODO: Setting

          if pcu.unit_type == :collection
            existing_unit = AnsibleCollection.find_by(namespace: pcu.unit_namespace, name: pcu.unit_name)
            return :import unless existing_unit

            unless existing_unit.ansible_content_versions.select{ |x| x.version == pcu.version }.empty?
              unless force_override
                return :noop
              end
            end
            :update
          else # type == :role

          end
        end
      end
    end
  end
end
