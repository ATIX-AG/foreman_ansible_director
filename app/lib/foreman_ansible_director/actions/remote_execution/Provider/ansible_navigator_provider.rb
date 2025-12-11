# frozen_string_literal: true

if defined? ForemanRemoteExecution
  module ForemanAnsibleDirector
    module Actions
      module RemoteExecution
        module Provider
          class AnsibleNavigatorProvider < RemoteExecutionProvider
            class << self
              def humanized_name
                'AnsibleDirector'
              end

              def provider_input_namespace
                :ansible
              end

              def proxy_command_options(template_invocation, host)
                playbook = ForemanAnsibleDirector::Generators::PlaybookGenerator.generate host
                inventory = ForemanAnsibleDirector::Generators::InventoryGenerator.generate host

                content = ForemanAnsibleDirector::Generators::ContentGenerator.generate host
                variables = ForemanAnsibleDirector::Generators::VariableGenerator.generate host

                begin
                  default_environment = ::ForemanAnsibleDirector::ExecutionEnvironment.find_by(
                    id: Setting[:ad_default_ee_internal]
                  )
                  raise ActiveRecord::RecordNotFound if environment.nil?
                end

                environment = host.lifecycle_environment&.execution_environment&.registry_url || default_environment

                unless host.lifecycle_environment.execution_environment
                  raise "Host #{host.name} is not in any Lifecycle environment"
                end
                super(template_invocation, host).merge(
                  inventory: inventory,
                  playbook: playbook,
                  content: content,
                  variables: variables,
                  execution_environment: environment
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
end
