# frozen_string_literal: true

module ForemanAnsibleDirector
  module Generators
    class InventoryGenerator
      class << self
        AD_PARAM_KEY_MAPPING = {
          'ansible_director_ansible_user' => :ansible_user,
          'ansible_director_ansible_become_user' => :ansible_become_user,
          'ansible_director_ansible_port' => :ansible_port,
          'ansible_director_ansible_become_method' => :ansible_become_method,
          'ansible_director_ansible_ssh_private_key_file' => :ansible_ssh_private_key_file,
        }.freeze

        def generate(host:,
                     host_address:,
                     template_invocation:)

          inventory_options, options = ansible_options(host, template_invocation)
          inventory_hash = {
            "#{host.name}": {
              hosts: {
                "#{host_address}": inventory_options,
              },
            },
          }
          [inventory_hash, options]
        end

        private

        # Returns valid Ansible inventory configuration parameters
        # Precedence is: job invocation inputs, ansible_director host params, REX host params
        def ansible_options(host, template_invocation)
          options = {}
          job_invocation = template_invocation&.job_invocation

          rex_host_param_settings = {
            ansible_user: host.host_param('remote_execution_ssh_user'),
            ansible_become_user: host.host_param('remote_execution_effective_user'),
            ansible_become_method: host.host_param('remote_execution_effective_user_method'),
            ansible_port: host.host_param('remote_execution_ssh_port'),
            ansible_ssh_private_key_file: host.host_param('ansible_ssh_private_key_file'),
          }.compact

          job_invocation_settings = {
            ansible_user: job_invocation&.ssh_user,
            ansible_become_user: template_invocation&.effective_user,
          }.compact

          merged = AD_PARAM_KEY_MAPPING.each_with_object(rex_host_param_settings) do |(param_name, key), settings|
            value = host.host_param(param_name)
            settings[key] = value if value.present?
          end.merge(job_invocation_settings).compact

          # Template invocation falls back to global setting. If the user has made a conscious effort
          # (i.e. set the host param), the parameter's value should be used.
          ad_host_param = host.host_param('ansible_director_ansible_become_user')
          rex_fallback = Setting[:remote_execution_effective_user]
          merged_param = merged[:ansible_become_user]
          # The check is as follows: If the ansible_director host param is set, check whether the prioritized value of
          # ansible_become_user value equals the REX setting (the fallback). Is this the case, the ansible_director
          # host param value is preferred over the fallback.
          if ad_host_param && (rex_fallback == merged_param && ad_host_param != merged_param)
            merged[:ansible_become_user] = ad_host_param
          end

          if merged[:ansible_become_user].present? && merged[:ansible_become_user] != merged[:ansible_user]
            merged[:ansible_become] = true
          end

          if (ssh_key_eff_value = merged[:ansible_ssh_private_key_file])
            escaped = ssh_key_eff_value.shellescape
            merged[:ansible_ssh_private_key_file] = escaped
            options[:ansible_ssh_private_key_file] = escaped
          end

          [merged, options]
        end
      end
    end
  end
end
