# frozen_string_literal: true

require 'foreman_remote_execution'

module ForemanAnsibleDirector
  class Engine < ::Rails::Engine
    config.to_prepare do
      RemoteExecutionProvider.register(
        :AnsibleNavigator,
        ForemanAnsibleDirector::Actions::RemoteExecution::Provider::AnsibleNavigatorProvider
      )
      RemoteExecutionProvider.register(
        :AnsibleScript,
        ForemanAnsibleDirector::Actions::RemoteExecution::Provider::AnsibleScriptProvider
      )

      ForemanAnsibleDirector::Engine.register_rex_feature
    end

    def self.register_rex_feature
      RemoteExecutionFeature.register(
        :ansible_director_configure_host,
        N_('Apply Ansible configuration'),
        description: N_('Configure the host using Ansible content assigned to it'),
        host_action_button: true
      )
      RemoteExecutionFeature.register(
        :ansible_run_playbook,
        N_('Run Ansible Playbook using Ansible Director'),
        description: N_('Runs an Ansible playbook defined by the user.'),
        host_action_button: true
      )
    end
  end
end
