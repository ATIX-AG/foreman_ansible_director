# frozen_string_literal: true

if defined? ForemanRemoteExecution
  module ForemanAnsibleDirector
    module Actions
      module RemoteExecution
        module Provider
          class AnsibleNavigatorProvider < RemoteExecutionProvider
            class << self
              def humanized_name
                'ansible-navigator via AnsibleDirector'
              end

              def provider_input_namespace
                :ansible
              end

              def proxy_command_options(template_invocation, host)
                playbook = ForemanAnsibleDirector::Generators::PlaybookGenerator.generate host
                inventory = ForemanAnsibleDirector::Generators::InventoryGenerator.generate host

                content = ForemanAnsibleDirector::Generators::ContentGenerator.generate host
                variables = ForemanAnsibleDirector::Generators::VariableGenerator.generate host

                execution_environment = host.ansible_lifecycle_environment&.execution_environment

                execution_environment ||= ::ForemanAnsibleDirector::ExecutionEnvironment.find_by(
                  id: Setting[:ad_default_ee_internal]
                )

                unless execution_environment
                  # TODO: Actual error message
                  raise StandardError
                end

                unless host.ansible_lifecycle_environment.execution_environment
                  raise "Host #{host.name} is not in any lifecycle environment"
                end
                super(template_invocation, host).merge(
                  inventory: inventory,
                  playbook: playbook,
                  content: content,
                  variables: variables,
                  execution_environment: {
                    id: execution_environment.id,
                    registry_url: execution_environment.registry_url,
                    ansible_core_version: execution_environment.ansible_version,
                  }
                )
              end

              def proxy_operation_name
                'meta'
              end

              def proxy_action_class
                'Proxy::AnsibleDirector::Actions::Meta::RunPlaybook'
              end

              def required_proxy_selector_for(_template)
                ::ForemanAnsibleDirector::AnsibleDirectorProxySelector.new
              end
            end
          end
        end
      end
    end
  end
end
