# frozen_string_literal: true

require 'git'
module ForemanAnsibleDirector
  module GitOps
    class LsRemote
      def initialize(git_remote)
        @git_client = ::ForemanAnsibleDirector::GitOps::BaseClient.git_client
        @git_remote = git_remote
      end

      def request
        @git_client.ls_remote(@git_remote)
      end
    end
  end
end
