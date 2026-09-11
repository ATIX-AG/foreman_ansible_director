# frozen_string_literal: true

module ForemanAnsibleDirector
  class AnsibleDirectorProxySelector < ::ForemanTasks::ProxySelector
    def available_proxies(host, provider, _capability: nil)
      host.remote_execution_proxies(provider)
    end
  end
end
