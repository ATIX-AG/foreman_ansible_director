# frozen_string_literal: true

module ForemanAnsibleDirector
  module Generators
    class ContentGenerator
      class << self
        def generate(host)
          host_content = host.ansible_content_assignments
          content = []

          host_content.each do |content_assignment|
            if content_assignment.consumable.is_a? AnsibleCollectionRole

              collection_role = content_assignment.consumable
              collection_version = collection_role.ansible_collection_version
              collection = collection_version.versionable

              cu = collection
              cuv = collection_version

            else # content_assignment.consumable.is_a? AnsibleRole

              cu = content_assignment.consumable
              cuv = content_assignment.content_unit_version

            end

            content << {
              type: cu.type == 'AnsibleCollection' ? 'collection' : 'role',
              identifier: cu.full_name,
              version: cuv.version,
              source: "https://#{SETTINGS[:fqdn]}/pulp_ansible/galaxy/#{host.organization_id}/#{cu.full_name}",
            }
          end

          content
        end
      end
    end
  end
end
