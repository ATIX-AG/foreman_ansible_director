# frozen_string_literal: true

module AnsibleContent
  class AnsibleContentHelpers
    class << self
      def decode_requirements_yml(raw_file)
        decoded_yml = base64_to_yml(raw_file)

        collections = []
        roles = []

        decoded_yml['collections']&.each do |collection|
          collections.push(ParsedAnsibleContentUnit.new(:collection, **collection))
        end

        decoded_yml['roles']&.each do |role|
          roles.push(ParsedAnsibleContentUnit.new(:role, **role))
        end

        [].concat(collections).concat(roles)
      end

      def resolve_destroy_payload(payload)
        units = {}

        payload.each do |unit|
          name = unit[:unit_name]

          unless name.match?(/^(.*)\.(.*)$/)
            raise "Invalid unit name format: #{name}" # TODO: Proper error code
          end

          unit_namespace, unit_name = name.match(/^(.*)\.(.*)$/).captures
          existing_unit = AnsibleContentUnit.find_any(namespace: unit_namespace, name: unit_name)

          raise "Unit not found: #{name}" unless existing_unit # TODO: Proper error code

          unit_type = existing_unit.collection? ? :collection : :role

          versions = []

          if unit_type == :collection
            versions = unit[:unit_versions]&.select do |version|
              existing_unit.ansible_content_versions.find_by(version: version)
            end

            if versions && versions.length == existing_unit.ansible_content_versions.count
              versions = [] # In this case, we are deleting the complete unit
            end
          end

          simple_unit = AnsibleContent::SimpleAnsibleContentUnit.new(
            unit_type: unit_type,
            unit_name: name,
            unit_versions: versions
          )

          units[name] = simple_unit
        end

        units.values
      end

      def resolve_import_payload(payload)
        units = {}
        payload.each do |unit|
          unit_type = valid_unit_type! unit[:unit_type]
          unit_name = valid_unit_name! unit[:unit_name]
          unit_source = valid_unit_source! unit[:unit_source]
          unit_versions = valid_unit_versions! unit[:unit_versions]
          unit_id = "#{unit_name}_#{Base64.encode64(unit_source)}" # Uniquely identifiable by name and source

          if (existing_unit = units[unit_id])
            existing_unit.versions = existing_unit.versions | unit_versions
          else
            sacu = SimpleAnsibleContentUnit.new(
              unit_type: unit_type,
              unit_name: unit_name,
              unit_source: unit_source,
              unit_versions: unit_versions
            )
            units[unit_id] = sacu
          end
        end
        units.values
      end

      private

      def valid_unit_name!(unit_name)
        return unit_name if /^(.*)\.(.*)$/.match?(unit_name)
        raise # TODO: Exception
      end

      def valid_unit_type!(unit_type)
        if (type = { 'collection' => :collection, 'role' => :role }[unit_type])
          return type
        end
        raise # TODO: Exception
      end

      def valid_unit_source!(unit_source)
        unit_source || 'https://galaxy.ansible.com/' # TODO: global param
      end

      def valid_unit_versions!(unit_versions)
        unit_versions&.each do |version|
          unless /^\d+\.\d+\.\d+$/.match?(version)
            raise # TODO: Exception
          end
        end
        unit_versions
      end

      def base64_to_yml(base64_string)
        base64_string = base64_string.split(',')[1] if base64_string.start_with?('data:application/x-yaml;base64,')
        YAML.safe_load(Base64.decode64(base64_string))
      end
    end
  end
end
