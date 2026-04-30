# frozen_string_literal: true

module ForemanAnsibleDirector
  module Generators
    class PlaybookGenerator
      class << self
        def generate(resolved_host_content:)
          tasks = []

          resolved_host_content.each do |content_assignment|
            consumable = content_assignment[:cuv]
            next unless consumable

            if consumable.is_a? ForemanAnsibleDirector::AnsibleCollectionRole
              acv = consumable.ansible_collection_version
              ac = acv.versionable
              fqrn = "#{ac.namespace}.#{ac.name}.#{consumable.name}"
            else
              ar = consumable.versionable
              fqrn = "#{ar.namespace}.#{ar.name}"
            end

            load_vars_block = {
              name: "Load variables for #{fqrn}",
              "ansible.builtin.include_vars": {
                file: "#{fqrn}_vars.yaml",
              },
            }

            load_role_block = {
              name: "Run role #{fqrn}",
              "ansible.builtin.include_role": {
                name: fqrn,
              },
            }

            tasks << load_vars_block
            tasks << load_role_block
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
end
