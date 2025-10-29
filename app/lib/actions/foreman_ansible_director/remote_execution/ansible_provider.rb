# frozen_string_literal: true

if defined? ForemanRemoteExecution
  module Actions
    module ForemanAnsibleDirector
      module RemoteExecution
        class AnsibleProvider < RemoteExecutionProvider
          class << self

            def humanized_name
              'AnsibleDirector'
            end

            def provider_input_namespace
              :ansible
            end

            def proxy_command_options(template_invocation, host)

              playbook = Generators::PlaybookGenerator.generate host
              inventory = Generators::InventoryGenerator.generate host

              content = Generators::ContentGenerator.generate host
              variables = Generators::VariableGenerator.generate host

              unless host.lifecycle_environment.execution_environment
                raise "Host #{host.name} is not in any Lifecycle environment"
              end
              super(template_invocation, host).merge(
                inventory: inventory,
                playbook: playbook,
                content: content,
                variables: variables,
                execution_environment: host.lifecycle_environment.execution_environment.registry_url
              )
            end

            def proxy_operation_name
              'meta'
            end

            def proxy_action_class
              'Proxy::AnsibleDirector::Actions::Meta::RunPlaybook'
            end

          end
        end
      end
    end
  end
end
