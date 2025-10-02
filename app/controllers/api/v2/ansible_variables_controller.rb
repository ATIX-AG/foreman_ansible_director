# frozen_string_literal: true

require 'open-uri'
require 'stringio'
require 'zlib'
require 'net/http'
require 'rubygems/package'
require 'uri'
require 'set'

module Api
  module V2
    class AnsibleVariablesController < AnsibleDirectorApiController
      include ::Api::Version2

      # before_action :find_resource
      #before_action :find_content_unit
      #before_action :find_organization

      # k = download_and_extract 'https://centos9-katello-devel-stable.example.com/pulp/content/1/nextcloud.admin/nextcloud-admin-2.1.0.tar.gz'
      # a = 2

      def index
        ::ForemanAnsibleDirector::VariableService.create_variable
        a = 2
      end

      def show
      end

      def override
      end

      def destroy_override
      end

      private

      def download_and_extract(url)
        url = "https://ansible-galaxy-ng.s3.dualstack.us-east-1.amazonaws.com/artifact/13/10aa3ed8f7bff5dd3b68afe26744c8603a7acb02f3e2b6b3eb07b4a695b310?response-content-disposition=attachment%3Bfilename%3Dnextcloud-admin-2.0.0.tar.gz&response-content-type=application%2Fgzip&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIA5DPYWLYOP6RDMQPA%2F20250924%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20250924T115314Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=b0a5702c9aa5fc477606e306f3faf77e1d4cff4fcb138892ef31afad7e7d508a"
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
        default_filter_list = %w[defaults/main.yml]

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

      def find_content_unit
        @ansible_content_unit = ContentUnit.find_by(id: params[:id])

        unless @ansible_content_unit
          return render_content_unit_error(
            "Content unit with id: #{params[:id]} does not exist."
          )
        end

        @ansible_content_version = @ansible_content_unit
                                     .content_unit_versions
                                     .find_by(version: params[:version])

        unless @ansible_content_version
          valid_versions = @ansible_content_unit.content_unit_versions.pluck(:version)
          render_content_unit_error(
            "Content unit #{@ansible_content_unit.full_name} does not exist in " \
              "version #{params[:version]}. Valid options are #{valid_versions}"
          )
        end
      end


      def render_content_unit_error(message)
        render_error('custom_error', status: :unprocessable_entity, locals: { message: message })
      end
    end
  end
end
