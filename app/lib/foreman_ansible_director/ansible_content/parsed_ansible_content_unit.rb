# frozen_string_literal: true

module ForemanAnsibleDirector
  module AnsibleContent
    class ParsedAnsibleContentUnit
      attr_reader :unit_type, :version, :source, :type, :src, :scm

      def initialize(unit_type, **kwargs)
        @unit_type = unit_type
        @name = kwargs['name']
        @version = kwargs['version']
        @source = kwargs['source'] || Setting[:ad_default_galaxy_url]
        @type = kwargs['type']
        @src = kwargs['src']
        @scm = kwargs['scm']
      end

      def git?
        case @unit_type
        when :role
          true if @scm == 'git'
        when :collection
          true if @type == 'git'
        end
      end

      # Full name of the content unit
      # "theforeman.operations" --> "theforeman.operations"
      def name
        return @name if @name
        infer_name_from_source
      end

      # Name of the content unit with respect to the namespace:
      # "theforeman.operations" --> "operations"
      def unit_name
        name.split('.').last
      end

      # Namespace of the content unit
      # "theforeman.operations" --> "theforeman"
      def unit_namespace
        name.split('.').first
      end

      def role_url
        return unless @unit_type == :role
        split = @name.split('.')
        # TODO: global param, version restriction
        "https://galaxy.ansible.com/api/v1/roles/?owner__username=#{split[0]}&name=#{split[1]}"
      end

      def collection_file
        return unless @unit_type == :collection
        YAML.dump(
          { 'collections' =>
             [
               {
                 'name' => @name,
                 'version' => @version,
                 'source' => @source,
                 'type' => @type,
               }.compact,
             ] }
        )
      end

      private

      def infer_name_from_source
        case @unit_type
        when :role
          split = @src.split('/')[-1].strip('.git')
        when :collection
          split = @source.split('/')[-1].strip('.git')
        end
        split
      end
    end
  end
end
