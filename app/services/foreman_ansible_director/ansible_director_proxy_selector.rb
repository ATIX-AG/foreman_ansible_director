# frozen_string_literal: true

module ForemanAnsibleDirector
  class AnsibleDirectorProxySelector < ::ForemanTasks::ProxySelector
    def available_proxies(host, provider, _capability: nil)
      host.remote_execution_proxies(provider)
      SmartProxy.all
    end

    def determine_proxy(*_args, **_kwargs)
      if Rails.env.development?
        # Use this to override the selection in development
        SmartProxy.find_by(id: 2)
      else
        # COMPAT 3.16 - 3: Execution constrained to the first smart proxy for the time being
        SmartProxy.first
      end
    end
  end
end
