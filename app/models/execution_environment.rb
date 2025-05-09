# frozen_string_literal: true

class ExecutionEnvironment < PulsibleModel
  scoped_search on: %i[name]

  belongs_to :organization, inverse_of: :execution_environments

  validates :name, presence: { message: 'Execution Environment name cannot be blank.' }, length: { maximum: 255 }
  validates :base_image_url, presence: { message: 'Execution Environment base image URL cannot be blank.' },
            length: { maximum: 255 }

  has_many :execution_environment_content_versions
  has_many :ansible_content_versions, through: :execution_environment_content_versions
end
