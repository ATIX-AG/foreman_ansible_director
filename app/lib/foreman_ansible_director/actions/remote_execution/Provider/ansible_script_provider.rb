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
                begin
                  environment = ::ForemanAnsibleDirector::ExecutionEnvironment.find_by(
                    id: Setting[:ad_default_ee_rex]
                  )
                  raise ActiveRecord::RecordNotFound if environment.nil?
                end

                raise "Host #{host.name} is not in any Lifecycle environment" unless host.lifecycle_environment
                unless host.lifecycle_environment.execution_environment
                  raise "Lifecycle Environment #{host.lifecycle_environment.name}
                          does not provide an execution environment"
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
