# frozen_string_literal: true

require 'foreman_remote_execution'

module ForemanAnsibleDirector
  class Engine < ::Rails::Engine
    config.to_prepare do
      RemoteExecutionProvider.register(
        :AnsibleNavigator,
        ForemanAnsibleDirector::Actions::RemoteExecution::Provider::AnsibleNavigatorProvider
      )

      ForemanAnsibleDirector::Engine.register_rex_feature
    end

    def self.register_rex_feature
      RemoteExecutionFeature.register(
        :ansible_run_host,
        N_('Run Ansible roles'),
        description: N_('Runs an Ansible playbook which contains all'\
                             ' the roles defined for a host'),
        host_action_button: true
      )
    end
  end
end
