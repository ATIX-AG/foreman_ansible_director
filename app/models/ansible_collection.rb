# frozen_string_literal: true

class AnsibleCollection < AnsibleContentUnit
  has_many :ansible_content_versions, as: :versionable, dependent: :destroy

  def requirements_file(pcu = nil, subtractive = false)
    units = []
    self.ansible_content_versions.each do | content_version |
      units.append(
        "name" => "#{self.namespace}.#{self.name}",
        "version" => content_version.version,
        "source" => content_version.source,
      )
    end

    if pcu
      if subtractive
        units = units.select { |unit| unit["version"] != pcu.version}
      else
        units.append(
          "name" => pcu.name,
          "version" => pcu.version,
          "source" => pcu.source,
        )
      end
    end

    YAML.dump({"collections" => units })
  end
end
