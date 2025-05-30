class AnsibleVariable < PulsibleModel
  belongs_to :ansible_role, optional: true
  belongs_to :ansible_collection_role, optional: true
  
  validates :name, presence: true
  
  # Ensure at least one of the relationships is present
  validates :ansible_role_id, presence: true, unless: -> { ansible_collection_role_id.present? }
  validates :ansible_collection_role_id, presence: true, unless: -> { ansible_role_id.present? }
  
  validates :name, uniqueness: { scope: :ansible_role_id }, if: -> { ansible_role_id.present? }
  validates :name, uniqueness: { scope: :ansible_collection_role_id }, if: -> { ansible_collection_role_id.present? }
end