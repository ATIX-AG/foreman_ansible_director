# frozen_string_literal: true

module Generators
  class PlaybookGenerator
    class << self
      def generate(host)
        host_content = host.ansible_content_assignments
        roles = []

        host_content.each do |content_assignment|
          next unless content_assignment.consumable.is_a? AnsibleCollectionRole

          collection_role = content_assignment.consumable
          collection_version = collection_role.ansible_collection_version
          collection = collection_version.versionable

          roles << "#{collection.namespace}.#{collection.name}.#{collection_role.name}"

          # else # content_assignment.consumable.is_a? AnsibleRole
        end

        [{

          name: 'Playbook',
          hosts: 'all',
          gather_facts: true,
          roles: roles,

        }]
      end
    end
  end
end
