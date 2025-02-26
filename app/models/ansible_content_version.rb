# frozen_string_literal: true

class AnsibleContentVersion < PulsibleModel
  belongs_to :versionable, polymorphic: true
end
