module AnsibleContent
  class ParsedAnsibleContentUnit
    attr_reader :unit_type, :version, :source, :type, :src, :scm

    def initialize(unit_type, **kwargs)
      @unit_type = unit_type
      @name = kwargs["name"]
      @version = kwargs["version"]
      @source = kwargs["source"] || "https://galaxy.ansible.com/" # TODO: global param
      @type = kwargs["type"]
      @src = kwargs["src"]
      @scm = kwargs["scm"]
    end

    def git?
      if @unit_type == :role
        if @scm == "git"
          return true
        end
      else
        if @unit_type == :collection
          if @type == "git"
            return true
          end
        end
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
      name.split(".").last
    end

    # Namespace of the content unit
    # "theforeman.operations" --> "theforeman"
    def unit_namespace
      name.split(".").first
    end

    def role_url
      if @unit_type == :role
        split = @name.split(".")
        "https://galaxy.ansible.com/api/v1/roles/?owner__username=#{split[0]}&name=#{split[1]}" # TODO: global param, version restriction
      end
    end

    def collection_file
      if @unit_type == :collection
        YAML.dump(
          {"collections" => 
             [
               {
                 "name"=> @name,
                 "version"=> @version,
                 "source"=> @source,
                 "type"=> @type
               }.compact
             ]
          })
      end
    end

    private

    def infer_name_from_source
      if @unit_type == :role
        split = @src.split("/")[-1].strip(".git")
      elsif @unit_type == :collection
        split = @source.split("/")[-1].strip(".git")
      end
      split
    end

  end
end