# frozen_string_literal: true

module ForemanAnsibleDirector
  module AnsibleContent
    # Simple representation of an Ansible content unit
    # To be used in cases where AnsibleContentUnit is too heavy, i.e. Actions
    class SimpleAnsibleContentUnit
      attr_accessor :versions
      attr_reader :unit_type, :name, :source, :type, :src, :scm

      def initialize(**kwargs)
        @unit_type = kwargs[:unit_type]
        @name = kwargs[:unit_name]
        @versions = kwargs[:unit_versions] || []
        @source = kwargs[:unit_source] || Setting[:ad_default_galaxy_url]
        @type = kwargs[:unit_type]
        @src = kwargs[:unit_src]
        @scm = kwargs[:unit_scm]
      end

      # Name of the content unit with respect to the namespace:
      # "theforeman.operations" --> "operations"
      def unit_name
        @name.split('.').last
      end

      # Namespace of the content unit
      # "theforeman.operations" --> "theforeman"
      def unit_namespace
        @name.split('.').first
      end

      def collection_file
        return unless @unit_type == :collection
        if @versions.length.positive?
          YAML.dump(
            { 'collections' => @versions.map do |version|
              {
                'name' => @name,
                'version' => version,
                'source' => @source,
                'type' => @type,
              }.compact
            end }
          )
        else
          YAML.dump(
            { 'collections' =>
                [
                  {
                    'name' => @name,
                    'source' => @source,
                  },
                ] }
          )
        end
      end

      def role_url
        return unless @unit_type == :role
        "#{source}api/v1/roles/?namespace=#{unit_namespace}&name=#{unit_name}" # TODO: version restriction
      end

      def to_hash
        {
          unit_type: @unit_type,
          name: @name,
          versions: @versions,
          source: @source,
          type: @type,
          src: @src,
          scm: @scm,
        }
      end
    end
  end
end
