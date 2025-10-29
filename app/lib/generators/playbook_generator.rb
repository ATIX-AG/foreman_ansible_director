# frozen_string_literal: true

module Generators
  class PlaybookGenerator
    class << self
      def generate(host)
        host_content = host.ansible_content_assignments
        tasks = []

        host_content.each do |content_assignment|
          next unless content_assignment.consumable.is_a? AnsibleCollectionRole

          collection_role = content_assignment.consumable
          collection_version = collection_role.ansible_collection_version
          collection = collection_version.versionable

          fqcn = "#{collection.namespace}.#{collection.name}.#{collection_role.name}"

          load_vars_block = {
            name: "Load variables for #{collection.namespace}.#{collection.name}.#{collection_role.name}",
            "ansible.builtin.include_vars": {
              file: "#{fqcn}_vars.yaml",
            }
          }
          debug_block = {
            name: "Display all variables for host",
            debug: {
              var: "hostvars[inventory_hostname]"
            }
          }
          load_role_block = {
            name: "Run role #{collection.namespace}.#{collection.name}.#{collection_role.name}",
            "ansible.builtin.include_role": {
              name: fqcn,
            }
          }

          tasks << load_vars_block
          #tasks << debug_block
          tasks << load_role_block

          # else # content_assignment.consumable.is_a? AnsibleRole
        end

        [{

          name: 'Playbook',
          hosts: 'all',
          gather_facts: true,
          tasks: tasks,

        }]
      end
    end
  end
end
