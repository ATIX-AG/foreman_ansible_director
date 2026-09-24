# frozen_string_literal: true

module ForemanAnsibleDirector
  class AnsibleDirectorRunProxySelector < RemoteExecutionProxySelector
    def available_proxies(host, provider, _capability: nil)
      reachable_proxies = super(host, provider)
      reachable_proxies.transform_values do |proxies|
        proxies.select { |proxy| proxy[:container_registry_auth_enabled] == true }
      end
    end
  end
end
