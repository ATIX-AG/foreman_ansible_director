module AnsibleContent

  # Simple representation of an Ansible content unit
  # To be used in cases where AnsibleContentUnit is too heavy, i.e. Actions
  class SimpleAnsibleContentUnit
    attr_reader :unit_type, :name, :versions, :source, :type, :src, :scm
    attr_writer :versions

    def initialize(**kwargs)
      @unit_type = kwargs[:unit_type]
      @name = kwargs[:unit_name]
      @versions = kwargs[:unit_versions] || []
      @source = kwargs[:unit_source] || "https://galaxy.ansible.com/" # TODO: global param
      @type = kwargs[:unit_type]
      @src = kwargs[:unit_src]
      @scm = kwargs[:unit_scm]
    end

    def unit_name
      @name.split(".").last
    end

    # Namespace of the content unit
    # "theforeman.operations" --> "theforeman"
    def unit_namespace
      @name.split(".").first
    end

    def collection_file
      if @unit_type == :collection
        if @versions.length > 0
          YAML.dump(
            { "collections" => @versions.map { |version|
              {
                "name" => @name,
                "version" => version,
                "source" => @source,
                "type" => @type
              }.compact
            }
            })
        else
          YAML.dump(
            { "collections" =>
                [
                  {
                    "name" => @name,
                    "source" => @source,
                  }
                ]
            }
          )
        end
      end
    end

    def role_url
      if @unit_type == :role
        "#{self.source}api/v1/roles/?namespace=#{self.unit_namespace}&name=#{self.unit_name}" # TODO: version restriction
      end
    end

    def to_hash
      {
        unit_type: @unit_type,
        name: @name,
        versions: @versions,
        source: @source,
        type: @type,
        src: @src,
        scm: @scm
      }
    end

  end
end