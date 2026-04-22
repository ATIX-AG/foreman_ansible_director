# frozen_string_literal: true

if defined? ForemanRemoteExecution
  module ForemanAnsibleDirector
    module Actions
      module RemoteExecution
        module Provider
          class AnsibleScriptProvider < RemoteExecutionProvider
            class << self
              def humanized_name
                'ansible-playbook via AnsibleDirector'
              end

              def provider_input_namespace
                :ansible
              end

              def proxy_command_options(template_invocation, host)
                inventory = ForemanAnsibleDirector::Generators::InventoryGenerator.generate host
                begin
                  environment = ::ForemanAnsibleDirector::ExecutionEnvironment.find_by(
                    id: Setting[:ad_default_ee_rex]
                  )
                  raise ActiveRecord::RecordNotFound if environment.nil?
                end

                raise "Host #{host.name} is not in any lifecycle environment" unless host.ansible_lifecycle_environment
                unless host.ansible_lifecycle_environment.execution_environment
                  raise "Lifecycle environment #{host.ansible_lifecycle_environment.name}
                          does not provide an Execution Environment"
                end
                # As the templates currently do not have an execution environment input, this suffices
                super(template_invocation, host).merge(
                  inventory: inventory,
                  execution_environment: environment
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
