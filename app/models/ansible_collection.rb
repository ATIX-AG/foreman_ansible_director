# frozen_string_literal: true

class AnsibleCollection < AnsibleContentUnit
  has_many :ansible_content_versions, as: :versionable, dependent: :destroy

  def requirements_file(simple_content_unit = nil, subtractive = false)
    units = []
    self.ansible_content_versions.each do |content_version|
      units.append(
        "name" => "#{self.namespace}.#{self.name}",
        "version" => content_version.version,
        "source" => content_version.source,
      )
    end

    if simple_content_unit
      if subtractive
        units = units.select { |unit| !simple_content_unit.versions.include?(unit["version"]) }
      else
        if simple_content_unit.versions&.length > 0
          simple_content_unit.versions.each do |version|
            units.append(
              "name" => simple_content_unit.name,
              "version" => version,
              "source" => simple_content_unit.source,
            )
          end
        else
          units.append(
            "name" => simple_content_unit.name,
            "source" => simple_content_unit.source,
          )
        end

      end
    end

    YAML.dump({ "collections" => units })
  end
end
