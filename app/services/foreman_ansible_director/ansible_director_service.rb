# frozen_string_literal: true

module ForemanAnsibleDirector
  class AnsibleDirectorService
    class << self
      include ::ForemanAnsibleDirector::RequestCtx::RequestContextHelper
    end
  end
end
