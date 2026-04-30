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
                content_source, = ::ForemanAnsibleDirector::AssignmentService.content_source_for host

                unless content_source
                  raise format('Host %<host_name>s is not in any lifecycle environment',
                    { host_name: host.name })
                end

                execution_environment = content_source.cs_execution_environment

                execution_environment ||= ::ForemanAnsibleDirector::ExecutionEnvironment.find_by(
                  id: Setting[:ad_default_ee_internal]
                )

                unless execution_environment
                  raise format('Host %<host_name>s does not have an execution environment assigned to it.',
                    { host_name: host.name })
                end

                _, resolved_assignments, = ::ForemanAnsibleDirector::AssignmentService.assignments_for(
                  target: host,
                  resolve: true
                )

                playbook = ForemanAnsibleDirector::Generators::PlaybookGenerator.generate(
                  resolved_host_content: resolved_assignments
                )
                inventory = ForemanAnsibleDirector::Generators::InventoryGenerator.generate host

                content = ForemanAnsibleDirector::Generators::ContentGenerator.generate(
                  host: host,
                  resolved_host_content: resolved_assignments
                )
                variables = ForemanAnsibleDirector::Generators::VariableGenerator.generate(
                  host: host,
                  resolved_host_content: resolved_assignments
                )

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
