# frozen_string_literal: true

class ExecutionEnvironment < AnsibleDirectorModel
  scoped_search on: %i[name]

  belongs_to :organization, inverse_of: :execution_environments

  has_many :execution_environment_content_units, dependent: :destroy
  has_many :content_units, through: :execution_environment_content_units
  has_many :content_unit_versions, through: :execution_environment_content_units
  has_many :lifecycle_environments, dependent: :nullify

  validates :name, presence: { message: 'Execution Environment name cannot be blank.' }, length: { maximum: 255 }
  validates :base_image_url, presence: { message: 'Execution Environment base image URL cannot be blank.' },
            length: { maximum: 255 }

  validates :ansible_version, presence: { message: 'Ansible Version cannot be blank.' }
  #validates :ansible_version,
  #  inclusion: { in: ::ForemanAnsibleDirector::Constants::ANSIBLE_VERSIONS,
  #               message: 'Ansible version "%<value>s" is not supported.' }

  after_save :trigger_rebuild, if: :rebuild_necessary? # TODO: Is this the correct callback? What about rollback?

  def registry_url
    registry_port = 4321
    "http://#{SETTINGS[:fqdn]}:#{registry_port}/ansibleng/#{id}"
  end

  def rebuild_necessary?
    saved_change_to_attribute?(:content_hash)
  end

  def generate_content_hash
    content_string = content_unit_versions.pluck(:versionable_id, :version)
    Digest::SHA2.new(256).hexdigest("#{content_string}:#{ansible_version}:#{base_image_url}")[0, 8]
  end

  def trigger_rebuild
    ForemanTasks.async_task(
      ::Actions::ForemanAnsibleDirector::Proxy::BuildExecutionEnvironment,
      proxy_task_id: SecureRandom.uuid,
      execution_environment_definition: {
        id: id,
        content: {
          base_image: base_image_url,
          ansible_core_version: ansible_version, # TODO: Update ansible version management
          content_units: content_unit_versions.map do |cuv|
                           {
                             type: cuv.versionable.type == 'AnsibleCollection' ? 'collection' : 'role',
                             identifier: cuv.versionable.full_name,
                             version: cuv.version,
                             source: "https://#{SETTINGS[:fqdn]}/pulp_ansible/galaxy/#{Organization.current.id}/#{cuv.versionable.full_name}",
                           }
                         end,
        },
      }
    )
  end

  def add_content_unit(content_unit, version)
    execution_environment_content_units.find_or_create_by(
      content_unit: content_unit,
      content_unit_version: version
    )
  end
end
