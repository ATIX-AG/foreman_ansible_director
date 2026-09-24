# frozen_string_literal: true

module ForemanAnsibleDirector
  class ExecutionEnvironment < ::ForemanAnsibleDirector::AnsibleDirectorModel
    belongs_to :organization, inverse_of: :execution_environments

    has_many :execution_environment_content_units, dependent: :destroy
    has_many :content_units, through: :execution_environment_content_units
    has_many :content_unit_versions, through: :execution_environment_content_units
    has_many :lifecycle_environments, dependent: :nullify

    validates :name,
      presence: { message: 'Execution Environment name cannot be blank.' },
      length: { maximum: 255 },
      uniqueness: { scope: :organization_id }
    validates :base_image_url, presence: { message: 'Execution Environment base image URL cannot be blank.' },
              length: { maximum: 255 }

    validates :ansible_version, presence: { message: 'Ansible Version cannot be blank.' }
    validates :organization_id, presence: true

    scoped_search on: :name, complete_value: true
    scoped_search on: :base_image_url, complete_value: true
    scoped_search on: :ansible_version, complete_value: true

    def registry_url!
      staging_product = ::Katello::Product.find_by(
        organization_id: self[:organization_id],
        name: ::ForemanAnsibleDirector::Constants::EE_STAGING_PRODUCT_NAME
      )
      unless staging_product
        raise ForemanTasks::Task::TaskCancelledException,
          "Execution Environment unavailable: Product #{::ForemanAnsibleDirector::Constants::EE_STAGING_PRODUCT_NAME}
            not found. Try rebuilding Execution Environment #{self[:name]}."
      end
      image_base_path = "id/#{self[:organization_id]}/#{staging_product.id}"
      image_name = "#{::ForemanAnsibleDirector::Constants::EE_IMAGE_BASENAME}_#{self[:id]}"
      image_path = "#{image_base_path}/#{image_name}"

      environment_repo = staging_product.root_repositories.find_by(name: image_name)

      unless environment_repo
        raise ForemanTasks::Task::TaskCancelledException,
          "Execution Environment unavailable: Repository #{image_path}
            not found. Try rebuilding Execution Environment #{self[:name]}."
      end

      "#{SETTINGS[:fqdn]}/#{image_path}:latest"
    end

    def rebuild_necessary?
      saved_change_to_attribute?(:content_hash)
    end

    def generate_content_hash
      content_string = content_unit_versions.order(:versionable_id, :version).pluck(:versionable_id, :version)
      Digest::SHA2.new(256).hexdigest("#{content_string}:#{ansible_version}:#{base_image_url}")[0, 8]
    end

    def trigger_rebuild
      ::ForemanAnsibleDirector::ExecutionEnvironmentService.build_execution_environment self
    end

    def add_content_unit(content_unit, version)
      execution_environment_content_units.find_or_create_by(
        content_unit: content_unit,
        content_unit_version: version
      )
    end

    def render_for_api
      {
        id: id,
        name: name,
        base_image_url: base_image_url,
        ansible_version: ansible_version,
        build_status: build_status,
        build_job: build_job,
        content: [],
      }
    end
  end
end
