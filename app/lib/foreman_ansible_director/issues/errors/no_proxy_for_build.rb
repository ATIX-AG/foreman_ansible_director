# frozen_string_literal: true

module ForemanAnsibleDirector
  module Issues
    module Errors
      class NoProxyForBuild < BaseError
        def title
          _('No smart proxy available for build')
        end

        def message
          <<~MESSAGE
            No smart proxy is available to build this execution environment.
            Ensure this organization contains at least one smart proxy with the feature "Ansible_Director".
            Further ensure that at least one of these smart proxies has the "container_registry_auth_enabled" setting
            set to "true".
            Try again after verifying this requirement.
          MESSAGE
        end

        def status_code
          404
        end
      end
    end
  end
end
