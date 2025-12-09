# frozen_string_literal: true

if defined? ForemanRemoteExecution
  module ForemanAnsibleDirector
    module Actions
      module RemoteExecution
        module Provider
          class AnsibleScriptProvider < RemoteExecutionProvider
            class << self
              def humanized_name
                'AnsibleDirector'
              end

              def provider_input_namespace
                :ansible
              end

              def proxy_command_options(template_invocation, host)
                inventory = ForemanAnsibleDirector::Generators::InventoryGenerator.generate host

                raise "Host #{host.name} is not in any Lifecycle environment" unless host.lifecycle_environment
                unless host.lifecycle_environment.execution_environment
                  raise "Lifecycle Environment #{host.lifecycle_environment.name}
                          does not provide an execution environment"
                end
                # TODO: Instead of failing, the global default EE should be used instead
                super(template_invocation, host).merge(
                  inventory: inventory,
                  execution_environment: ExecutionEnvironment.find_by(id: 1).registry_url
                  # host.lifecycle_environment.execution_environment.registry_url
                )
              end

              def proxy_operation_name
                'meta'
              end

              def proxy_action_class
                'Proxy::AnsibleDirector::Actions::Meta::RunAnsibleScript'
              end
            end
          end
        end
      end
    end
  end
end
