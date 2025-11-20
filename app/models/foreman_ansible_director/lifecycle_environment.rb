# frozen_string_literal: true

module ForemanAnsibleDirector
  class LifecycleEnvironment < ::ForemanAnsibleDirector::AnsibleDirectorModel
    belongs_to :organization, inverse_of: :lifecycle_environments

    belongs_to :execution_environment, optional: true

    has_many :lifecycle_environment_content_unit_versions, dependent: :destroy
    has_many :direct_content_unit_versions, through: :lifecycle_environment_content_unit_versions,
  source: :content_unit_version

    belongs_to :content_snapshot, optional: true
    has_many :snapshot_content_unit_versions, through: :content_snapshot, source: :content_unit_versions

    belongs_to :lifecycle_environment_path,
      class_name: 'LifecycleEnvironmentPath'
    belongs_to :parent,
      class_name: 'LifecycleEnvironment',
      optional: true
    has_many :children,
      class_name: 'LifecycleEnvironment',
      foreign_key: 'parent_id',
      dependent: :destroy,
      inverse_of: :parent

    validates :name, presence: true
    validates :position, presence: true, numericality: { greater_than_or_equal_to: 0 }
    # validates :position, uniqueness: { scope: :lifecycle_environment_path_id }

    # scope :by_path, ->(path_id) { where(lifecycle_environment_path_id: path_id) }
    # scope :ordered, -> { order(:position) }
    # scope :roots, -> { where(parent_id: nil) }

    def content_unit_versions
      if using_snapshot_content?
        snapshot_content_unit_versions
      else
        direct_content_unit_versions
      end
    end

    def assign_execution_environment!(execution_environment_id)
      execution_env = ::ForemanAnsibleDirector::ExecutionEnvironment.find_by(id: execution_environment_id)

      unless execution_env
        errors.add(:execution_environment_id, 'not found')
        return false
      end

      update(execution_environment_id: execution_env.id)
    end

    # TODO: This does not work. Add the content_unit_id to the join table for checking
    def assign_content_unit_version!(content_unit_version)
      existing_version = lifecycle_environment_content_unit_versions
                         .find_by(content_unit_version_id: content_unit_version.id)

      replace = true # TODO: Setting

      if existing_version
        if replace
          existing_version.destroy!
        else
          raise ArgumentError, "LifecycleEnvironment already has ContentUnit #{content_unit_version.versionable_id} " \
            "(existing version: #{existing_version.id}, attempted: #{content_unit_version.id})"
        end
      end

      # Create the association
      lifecycle_environment_content_unit_versions.create!(content_unit_version: content_unit_version)

      content_unit_version
    end

    def using_snapshot_content?
      !content_snapshot.nil?
    end

    def content_hash
      if using_snapshot_content?
        content_snapshot.content_hash
      else
        content_string = content_unit_versions.pluck(:versionable_id, :version)
        Digest::SHA2.new(256).hexdigest("#{content_string}:#{execution_environment&.id || 'default'}")[0, 8]
      end
    end

    def protected?
      protected
    end

    def root?
      parent_id.nil?
    end

    def leaf?
      children.empty?
    end

    def ancestors
      return [] unless parent
      [parent] + parent.ancestors
    end
  end
end
