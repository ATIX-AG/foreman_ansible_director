# frozen_string_literal: true

module ForemanAnsibleDirector
  class AnsibleDirectorBuildProxySelector < ::ForemanTasks::ProxySelector
    def available_proxies(execution_environment_org_id:)
      SmartProxy
        .with_taxonomy_scope(nil, Organization.find_by(id: execution_environment_org_id))
        .with_features('Ansible_Director')
        .where(container_registry_auth_enabled: true)
    end

    def determine_proxy(execution_environment_org_id:)
      select_by_jobs_count(available_proxies(execution_environment_org_id: execution_environment_org_id))
    end
  end
end
