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

            # TODO: The output is not working because rex is filtering by task id. Figure out how to pass the generated id to the proxy action.

            def provider_input_namespace
              :ansible
            end

            def proxy_command_options(template_invocation, host)

              playbook = Generators::PlaybookGenerator.generate host
              inventory = Generators::InventoryGenerator.generate host

              content = Generators::ContentGenerator.generate host

              unless host.lifecycle_environment.execution_environment
                raise "Host #{host.name} is not in any Lifecycle environment"
              end
              super(template_invocation, host).merge(
                inventory: inventory,
                playbook: playbook,
                content: content,
                execution_environment: host.lifecycle_environment.execution_environment.registry_url
              )
            end

            #def provider_inputs
            #  [
            #    ForemanRemoteExecution::ProviderInput.new(
            #      name: 'tags',
            #      label: _('Tags'),
            #      value: '',
            #      value_type: 'plain',
            #      description: 'Tags used for Ansible execution'
            #    ),
            #    ForemanRemoteExecution::ProviderInput.new(
            #      name: 'tags_flag',
            #      label: _('Include/Exclude Tags'),
            #      value: 'include',
            #      description: 'Option whether to include or exclude tags',
            #      options: "include\nexclude"
            #    )
            #  ]
            #end

            #def provider_inputs_doc
            #  opts = provider_inputs.find { |input| input.name == 'tags_flag' }.options.split("\n")
            #  {
            #    :namespace => provider_input_namespace,
            #    :opts => { :desc => N_('Ansible provider specific inputs') },
            #    :children => [
            #      {
            #        :name => :tags,
            #        :type => String,
            #        :opts => { :required => false, :desc => N_('A comma separated list of tags to use for Ansible run') }
            #      },
            #      {
            #        :name => :tags_flag,
            #        :type => opts,
            #        :opts => { :required => false, :desc => N_('Include\Exclude tags for Ansible run') }
            #      }
            #    ]
            #  }
            #end

            #def proxy_command_provider_inputs(template_invocation)
            #  tags = template_invocation.provider_input_values.find_by(:name => 'tags')&.value || ''
            #  tags_flag = template_invocation.provider_input_values.find_by(:name => 'tags_flag')&.value || ''
            #  { :tags => tags, :tags_flag => tags_flag }
            #end

            def proxy_operation_name
              'meta'
            end

            def proxy_action_class
              'Proxy::AnsibleDirector::Actions::Meta::RunPlaybook'
            end

            #def proxy_batch_size
            #  value = Setting['foreman_ansible_proxy_batch_size']
            #  value.presence && value.to_i
            #end

            private

            #def ansible_command?(template)
            #  template.remote_execution_features.
            #    where(:label => 'ansible_run_host').empty? && !template.ansible_callback_enabled
            #end
          end
        end
      end
    end
  end
end
