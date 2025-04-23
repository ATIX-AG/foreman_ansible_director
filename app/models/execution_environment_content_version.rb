# frozen_string_literal: true

class ExecutionEnvironmentContentVersion < PulsibleModel
  belongs_to :execution_environment
  belongs_to :ansible_content_version
end
