# frozen_string_literal: true

module ForemanAnsibleDirector
  module Generators
    class ContentGenerator
      class << self
        def generate(host:,
                     resolved_host_content:)

          content = {}

          resolved_host_content.each do |content_assignment|
            consumable = content_assignment[:cuv]
            next unless consumable

            if consumable.is_a? ::ForemanAnsibleDirector::AnsibleCollectionRole
              cuv = consumable.ansible_collection_version
              cu = cuv.versionable
            else # consumable.is_a? AnsibleRole
              cuv = consumable
              cu = consumable.versionable
            end

            if cuv.source_type == 'git'
              distribution_suffix = Base64.encode64(cuv.version[0, 16]).strip
              source = "https://#{SETTINGS[:fqdn]}/pulp_ansible/galaxy/#{host.organization_id}/#{cu.full_name}-#{cuv.source_type}-#{distribution_suffix}"

              next if content.key? source
              content[source] = {
                type: cu.type == 'ForemanAnsibleDirector::AnsibleCollection' ? 'collection' : 'role',
                identifier: cu.full_name,
                source: source,
              }
            else
              source = "https://#{SETTINGS[:fqdn]}/pulp_ansible/galaxy/#{host.organization_id}/#{cu.full_name}-#{cuv.source_type}"
              next if content.key? [source, cuv.version]

              content[[source, cuv.version]] = {
                type: cu.type == 'ForemanAnsibleDirector::AnsibleCollection' ? 'collection' : 'role',
                identifier: cu.full_name,
                version: cuv.version,
                source: "https://#{SETTINGS[:fqdn]}/pulp_ansible/galaxy/#{host.organization_id}/#{cu.full_name}-#{cuv.source_type}",
              }
            end
          end

          content.values
        end
      end
    end
  end
end
