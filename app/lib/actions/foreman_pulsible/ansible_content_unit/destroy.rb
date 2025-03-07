module Actions
  module ForemanPulsible
    module AnsibleContentUnit
      class Destroy < ::Actions::ForemanPulsible::Base::PulsibleAction

        input_format do
          param :content_unit_name, String, required: false
          param :content_unit_id, Integer, required: false
          param :content_unit_version, String, required: false
          param :content_unit_version_id, Integer, required: false
          param :content_unit_type, String, required: true
        end

        def plan(args)

          if args[:content_unit_version]
            plan_partial_destroy(args)
          else
            plan_full_destroy(args)
          end
          plan_self(args)
        end

        def finalize
          if input[:content_unit_type] == "collection"
            existing_unit = AnsibleCollection.find_by(id: input[:content_unit_id]) # find_unit
            if input[:content_unit_version] # partial
              existing_unit.ansible_content_versions.find_by(version: input[:content_unit_version]).destroy
            else
              existing_unit.destroy # find_unit
            end
          end
        end

        private

        def plan_full_destroy(args)
          acu = AnsibleCollection.find_by(id: args[:content_unit_id]) # find_unit

          concurrence do

            plan_action(::Actions::ForemanPulsible::Pulp3::Ansible::Repository::Destroy,
                        repository_href: acu.pulp_repository_href)
            plan_action(::Actions::ForemanPulsible::Pulp3::Ansible::Distribution::Destroy,
                        distribution_href: acu.pulp_distribution_href)

            if args[:content_unit_type] == :collection
              plan_action(::Actions::ForemanPulsible::Pulp3::Ansible::Remote::Collection::Destroy,
                          collection_remote_href: acu.pulp_remote_href)
            end
          end
        end

        def plan_partial_destroy(args)
          if args[:content_unit_type] == :collection
            acu = AnsibleCollection.find_by(id: args[:content_unit_id]) # find_unit

            _remote_update_action = plan_action(::Actions::ForemanPulsible::Pulp3::Ansible::Remote::Collection::Update,
                        collection_remote_href: acu.pulp_remote_href,
                        requirements: acu.requirements_file(::AnsibleContent::ParsedAnsibleContentUnit.new(:collection, **{ "name" => "nextcloud.admin", "version" => "2.0.0" }), true))
            _snyc_action = plan_action(
                  ::Actions::ForemanPulsible::Pulp3::Ansible::Repository::Sync,
                  repository_href: acu.pulp_repository_href,
                  remote_href: acu.pulp_remote_href,
              )
          else
            # TODO: Role support
          end
        end

        def find_unit(args)
          case args[:content_unit_name]
          when :collection
          when :role
          else
            # TODO: Error
          end
        end

      end
    end
  end
end