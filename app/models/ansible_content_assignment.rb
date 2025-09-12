# frozen_string_literal: true

class AnsibleContentAssignment < PulsibleModel

  belongs_to :consumable, polymorphic: true
  belongs_to :assignable, polymorphic: true

end
