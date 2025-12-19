# frozen_string_literal: true

module ForemanAnsibleDirector
  module Actions
    module GitOps
      class LsRemote < ::ForemanAnsibleDirector::Actions::Base::AnsibleDirectorAction
        input_format do
          param :git_remote, String, required: true
        end

        output_format do
          param :git_ls_remote, Hash
        end

        def run
          response = ::ForemanAnsibleDirector::GitOps::LsRemote.new(
            input[:git_remote]
          ).request
          output.update(git_ls_remote: response)
        end
      end
    end
  end
end
