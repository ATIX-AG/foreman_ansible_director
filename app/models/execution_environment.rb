# frozen_string_literal: true

class ExecutionEnvironment < PulsibleModel
  scoped_search on: %i[name]

  belongs_to :organization, inverse_of: :execution_environments

  has_many :execution_environment_content_units, dependent: :destroy
  has_many :content_units, through: :execution_environment_content_units
  has_many :content_unit_versions, through: :execution_environment_content_units

  validates :name, presence: { message: 'Execution Environment name cannot be blank.' }, length: { maximum: 255 }
  validates :base_image_url, presence: { message: 'Execution Environment base image URL cannot be blank.' },
            length: { maximum: 255 }

  validates :ansible_version, presence: { message: 'Ansible Version cannot be blank.' }
  validates :ansible_version,
    inclusion: { in: ::ForemanPulsible::Constants::ANSIBLE_VERSIONS,
                 message: 'Ansible version "%<value>s" is not supported.' }

  def add_content_unit(content_unit, version)
    execution_environment_content_units.find_or_create_by(
      content_unit: content_unit,
      content_unit_version: version
    )
  end
end
