# frozen_string_literal: true

class AnsibleCollection < AnsibleContentUnit
  has_many :ansible_content_versions, as: :versionable

  def requirements_file(pcu = nil)
    units = []
    self.ansible_content_versions.each do | content_version |
      units.append(
        "name" => "#{self.namespace}.#{self.name}",
        "version" => content_version.version,
        "source" => content_version.source,
      )
    end

    if pcu
      units.append(
        "name" => pcu.name,
        "version" => pcu.version,
        "source" => pcu.source,
      )
    end

    YAML.dump({"collections" => units })
  end
end
