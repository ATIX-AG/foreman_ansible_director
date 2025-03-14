module Actions
  module ForemanPulsible
    module AnsibleContentUnit
      class Destroy < ::Actions::ForemanPulsible::Base::PulsibleAction

        input_format do
          param :unit
        end

        def plan(args)
          unit = args[:unit]

          if unit.versions
            plan_partial_destroy(unit)
          else
            plan_full_destroy(unit)
          end
          plan_self(
            unit_name: unit.unit_name,
            unit_namespace: unit.unit_namespace,
            unit_type: unit.unit_type,
            unit_versions: unit.versions
          )
        end

        def finalize
          acu = find_unit(name: input[:unit_name], namespace: input[:unit_namespace])
          if input[:unit_type] == "collection"
            if (versions = input[:unit_versions]) # partial
              versions.each do |version|
                acu&.ansible_content_versions.&find_by(version: version).destroy
              end
            else
              acu&.destroy
            end
          else
            acu&.destroy
          end
        end

        private

        def plan_full_destroy(unit)
          acu = find_unit(name: unit.unit_name, namespace: unit.unit_namespace) # find_unit

          concurrence do

            plan_action(::Actions::ForemanPulsible::Pulp3::Ansible::Repository::Destroy,
                        repository_href: acu.pulp_repository_href)
            plan_action(::Actions::ForemanPulsible::Pulp3::Ansible::Distribution::Destroy,
                        distribution_href: acu.pulp_distribution_href)

            if acu.is_collection?
              plan_action(::Actions::ForemanPulsible::Pulp3::Ansible::Remote::Collection::Destroy,
                          collection_remote_href: acu.pulp_remote_href)
            else
              plan_action(::Actions::ForemanPulsible::Pulp3::Ansible::Remote::Role::Destroy,
                          role_remote_href: acu.pulp_remote_href)
            end
          end
        end

        def plan_partial_destroy(unit)
          acu = ::AnsibleContentUnit.find_any(name: unit.unit_name, namespace: unit.unit_namespace)
          if acu&.is_collection?

            sequence do
              _remote_update_action = plan_action(::Actions::ForemanPulsible::Pulp3::Ansible::Remote::Collection::Update,
                                                  collection_remote_href: acu.pulp_remote_href,
                                                  requirements: acu.requirements_file(unit, subtractive = true))
              _snyc_action = plan_action(
                ::Actions::ForemanPulsible::Pulp3::Ansible::Repository::Sync,
                repository_href: acu.pulp_repository_href,
                remote_href: acu.pulp_remote_href,
              )
            end

          else
            # TODO: Role support
          end
        end

        def find_unit(**args)
          ::AnsibleContentUnit.find_any(args)
        end

      end
    end
  end
end