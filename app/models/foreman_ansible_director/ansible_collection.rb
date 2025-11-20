# frozen_string_literal: true

module ForemanAnsibleDirector
  class AnsibleCollection < ::ForemanAnsibleDirector::ContentUnit

    

    has_many :content_unit_versions, as: :versionable, dependent: :destroy
    has_many :ansible_collection_roles, through: :content_unit_versions

    validates :name, presence: true
    validates :namespace, presence: true
    validates :namespace, uniqueness: { scope: :name }

    def requirements_file(simple_content_unit = nil, subtractive: false)
      units = []
      content_unit_versions.each do |content_version| # Fixed: was ansible_content_versions
        units.append(
          'name' => "#{namespace}.#{name}",
          'version' => content_version.version,
          'source' => source
        )
      end

      if simple_content_unit
        if subtractive
          units = units.reject { |unit| simple_content_unit.versions.include?(unit['version']) }
        elsif simple_content_unit.versions&.length&.positive?
          simple_content_unit.versions.each do |version|
            units.append(
              'name' => simple_content_unit.name,
              'version' => version,
              'source' => simple_content_unit.source
            )
          end
        else
          units.append(
            'name' => simple_content_unit.name,
            'source' => simple_content_unit.source
          )

        end
      end

      YAML.dump({ 'collections' => units })
    end
  end
end