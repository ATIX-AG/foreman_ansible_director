# frozen_string_literal: true

class ContentSnapshot < PulsibleModel
  has_many :content_snapshot_content_unit_versions, dependent: :destroy
  has_many :content_unit_versions, through: :content_snapshot_content_unit_versions

  has_many :lifecycle_environments, dependent: :nullify

  def increment_references
    update!(references: self.references += 1)
  end

  def decrement_references
    update!(references: self.references -= 1)
    destroy! if self.references.zero?
  end
end
