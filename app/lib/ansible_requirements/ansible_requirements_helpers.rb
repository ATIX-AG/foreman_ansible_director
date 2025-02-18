# frozen_string_literal: true

module AnsibleRequirements
  class AnsibleRequirementsHelpers
    class << self
      def decode_requirements_yml(raw_file)
        decoded_yml = base64_to_yml(raw_file)

        collections = []
        roles = []

        decoded_yml["collections"]&.each do |collection|
          collections.push(ParsedAnsibleContentUnit.new(:collection, **collection))
        end

        decoded_yml["roles"]&.each do |role|
          roles.push(ParsedAnsibleContentUnit.new(:role, **role))
        end

        [].concat(collections).concat(roles)
      end

      def base64_to_yml(base64_string)
        if base64_string.start_with?('data:application/x-yaml;base64,')
          base64_string = base64_string.split(',')[1]
        end
        YAML.load(Base64.decode64(base64_string))
      end
    end
  end
end
