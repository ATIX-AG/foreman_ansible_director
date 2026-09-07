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
                inventory = ForemanAnsibleDirector::Generators::InventoryGenerator.generate(
                  host: host,
                  ansible_user: template_invocation.job_invocation&.ssh_user ||
                    host.host_param('remote_execution_ssh_user')
                )
                begin
                  environment = host&.ansible_lifecycle_environment&.execution_environment ||
                                ::ForemanAnsibleDirector::ExecutionEnvironment.find_by(
                                  id: Setting[:ansible_director_default_ee_rex]
                                )
                  unless environment
                    raise "Host #{host.name} is not in any lifecycle environment
                    and the setting 'ansible_director_default_ee_rex' is not provided."
                  end
                end

                # As the templates currently do not have an execution environment input, this suffices
                super(template_invocation, host).merge(
                  inventory: inventory,
                  execution_environment: environment.registry_url
                )
              end

              def proxy_operation_name
                'meta'
              end

              def proxy_action_class
                'Proxy::AnsibleDirector::Actions::Meta::RunAnsibleScript'
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
