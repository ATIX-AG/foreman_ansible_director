# frozen_string_literal: true

require 'git'
module ForemanAnsibleDirector
  module GitOps
    # For now, this class is bloat, but if I ever need to configure Git in any way, I can use it.
    class BaseClient
      class << self
        def git_client
          Git
        end
      end
    end
  end
end
