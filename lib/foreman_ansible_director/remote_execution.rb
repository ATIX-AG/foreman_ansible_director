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
        :ansible_run_host,
        N_('Run Ansible roles'),
        description: N_('Runs an Ansible playbook which contains all'\
                             ' the roles defined for a host'),
        host_action_button: true
      )
      RemoteExecutionFeature.register(
        :ansible_run_playbook,
        N_('Run Ansible Playbook'),
        description: N_('Runs an Ansible playbook defined by the user.'),
        host_action_button: true
      )
    end
  end
end
