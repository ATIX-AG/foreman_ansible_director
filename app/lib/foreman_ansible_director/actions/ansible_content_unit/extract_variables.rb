# frozen_string_literal: true

require 'rubygems/package'

module ForemanAnsibleDirector
  module Actions
    module AnsibleContentUnit
      class ExtractVariables < ::ForemanAnsibleDirector::Actions::Base::AnsibleDirectorAction
        input_format do
          param :list_action_output, Object, required: true
          param :repository_show_action_output, Object, required: true
          param :unit_name, String, required: true
          param :unit_namespace, String, required: true
          param :unit_name_suffix, String, required: false
          param :organization_id, String, required: true
          param :skip, Boolean, required: false
        end

        # output_format do
        #  param :extract_variables_response, Hash
        # end

        def run
          return if input[:skip]
          output.update(extract_variables_response: []) if input[:skip]
          unit_identifier = "#{input[:unit_namespace]}.#{input[:unit_name]}"
          distribution_path = unit_identifier
          distribution_path = "#{unit_identifier}-#{input[:unit_name_suffix]}" if input[:unit_name_suffix]
          imported_versions = input.dig(:list_action_output, :repository_artifacts, :results)

          results = {}
          imported_versions.each do |version|
            results[version[:version]] =
              extract_from_collection(unit_identifier, distribution_path, version[:version], input[:organization_id])
          end
          output.update(extract_variables_response: results)
        end

        private

        def extract_from_collection(unit_identifier, distribution_path, unit_version, organization_id)
          url = "https://#{SETTINGS[:fqdn]}/pulp_ansible/galaxy/default/api/v3/plugin/ansible/content/#{organization_id}/#{distribution_path}/collections/artifacts/#{unit_identifier.tr(
            '.', '-'
          )}-#{unit_version}.tar.gz"
          begin
            response = RestClient.get(url)
            raise "Failed to download (HTTP status: #{response.code})" if response.code != 200
            compressed_data = response.body
          rescue RestClient::Exception => e
            raise "Failed to download: #{e.message}"
          end

          gzip_reader = Zlib::GzipReader.new(StringIO.new(compressed_data))
          tar_reader = Gem::Package::TarReader.new(gzip_reader)

          variables_filter_list = %w[]
          default_filter_list = %w[defaults/main.yml defaults/main.yaml]

          roles = Hash.new { |h, k| h[k] = {} }

          tar_reader.each do |entry|
            next unless entry.file?
            next unless entry.full_name.start_with?('roles/')

            relative_path = entry.full_name.sub(%r{^roles/}, '')
            parts = relative_path.split('/', 2)
            next unless parts.size == 2

            role_name, file_name = parts

            if variables_filter_list.include?(file_name)
              roles[role_name][:variables] ||= []
              roles[role_name][:variables] << entry.read
            elsif default_filter_list.include?(file_name)
              roles[role_name][:defaults] ||= []
              roles[role_name][:defaults] << entry.read
            end
          end

          tar_reader.close
          gzip_reader.close

          roles.transform_values! do |v|
            all_defaults = {}
            v[:defaults].each do |defaults_yaml_str|
              if (loaded = YAML.safe_load(defaults_yaml_str))
                all_defaults.merge!(loaded)
              end
            end
            all_defaults
          end
        end
      end
    end
  end
end
