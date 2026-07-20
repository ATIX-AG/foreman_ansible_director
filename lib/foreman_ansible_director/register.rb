# frozen_string_literal: true

require_relative 'constants'

Foreman::Plugin.register :foreman_ansible_director do
  requires_foreman '>= 3.12.0'
  register_gettext

  sub_menu :top_menu, :ansible, caption: N_('Ansible'), after: :hosts_menu, icon: 'pficon pficon-in-progress' do
    menu :top_menu, :ansible_content,
      url: '/ansible/content',
      caption: 'Content',
      url_hash: {
        controller: 'foreman_ansible_director/api/v2/ansible_content',
        action: 'index',
      }
    menu :top_menu, :ansible_execution_environments,
      url: '/ansible/execution_environments',
      caption: 'Execution Environments',
      url_hash: {
        controller: 'foreman_ansible_director/api/v2/execution_environments',
        action: 'index',
      }
    menu :top_menu, :ansible_environments,
      url: '/ansible/environments',
      caption: 'Environments',
      url_hash: {
        controller: 'foreman_ansible_director/api/v2/lifecycle_environment_paths',
        action: 'index',
      }
  end

  security_block :foreman_ansible_director do
    ## Ansible Content
    # View
    permission :view_ansible_content,
      { 'foreman_ansible_director/api/v2/ansible_content': %i[index version_detail auto_complete_search],
        'foreman_ansible_director/api/v2/status': %i[content] },
      resource_type: 'ForemanAnsibleDirector::ContentUnit'
    # Create
    permission :create_ansible_content,
      { 'foreman_ansible_director/api/v2/ansible_content': [:create_units] },
      resource_type: 'ForemanAnsibleDirector::ContentUnit'
    # Edit
    # Destroy
    permission :destroy_ansible_content,
      { 'foreman_ansible_director/api/v2/ansible_content': %i[destroy_units consistency_check] },
      resource_type: 'ForemanAnsibleDirector::ContentUnit'
    ## Ansible Variables
    # View
    permission :view_ansible_director_variables,
      { 'foreman_ansible_director/api/v2/ansible_variables': %i[show index] },
      resource_type: 'ForemanAnsibleDirector::AnsibleVariable'
    # Edit
    permission :edit_ansible_director_variables,
      { 'foreman_ansible_director/api/v2/ansible_variables': [:update] },
      resource_type: 'ForemanAnsibleDirector::AnsibleVariable'
    # Destroy
    ## Ansible Variable Overrides
    # View
    permission :view_ansible_director_variable_overrides,
      { 'foreman_ansible_director/api/v2/ansible_variable_overrides': [:index_for_target] },
      resource_type: 'LookupValue'
    # Create
    permission :create_ansible_director_variable_overrides,
      { 'foreman_ansible_director/api/v2/ansible_variable_overrides': [:create] },
      resource_type: 'LookupValue'
    # Edit
    permission :edit_ansible_director_variable_overrides,
      { 'foreman_ansible_director/api/v2/ansible_variable_overrides': [:update] },
      resource_type: 'LookupValue'
    # Destroy
    permission :destroy_ansible_director_variable_overrides,
      { 'foreman_ansible_director/api/v2/ansible_variable_overrides': [:destroy] },
      resource_type: 'LookupValue'
    # Ansible lifecycle environments
    # View
    permission :view_ansible_lifecycle_environments,
      { 'foreman_ansible_director/api/v2/lifecycle_environments': %i[show content] },
      resource_type: 'ForemanAnsibleDirector::LifecycleEnvironment'
    # Create
    permission :create_ansible_lifecycle_environments,
      { 'foreman_ansible_director/api/v2/lifecycle_environments': [:create] },
      resource_type: 'ForemanAnsibleDirector::LifecycleEnvironment'
    # Edit
    permission :edit_ansible_lifecycle_environments,
      { 'foreman_ansible_director/api/v2/lifecycle_environments': %i[update update_content assign] },
      resource_type: 'ForemanAnsibleDirector::LifecycleEnvironment'
    # Destroy
    permission :destroy_ansible_lifecycle_environments,
      { 'foreman_ansible_director/api/v2/lifecycle_environments': [:destroy] },
      resource_type: 'ForemanAnsibleDirector::LifecycleEnvironment'
    ## Ansible lifecycle environment paths
    # View
    permission :view_ansible_lifecycle_environment_paths,
      { 'foreman_ansible_director/api/v2/lifecycle_environment_paths': %i[index auto_complete_search] },
      resource_type: 'ForemanAnsibleDirector::LifecycleEnvironmentPath'
    # Create
    permission :create_ansible_lifecycle_environment_paths,
      { 'foreman_ansible_director/api/v2/lifecycle_environment_paths': [:create] },
      resource_type: 'ForemanAnsibleDirector::LifecycleEnvironmentPath'
    # Edit
    permission :edit_ansible_lifecycle_environment_paths,
      { 'foreman_ansible_director/api/v2/lifecycle_environment_paths': [:update] },
      resource_type: 'ForemanAnsibleDirector::LifecycleEnvironmentPath'
    # Destroy
    permission :destroy_ansible_lifecycle_environment_paths,
      { 'foreman_ansible_director/api/v2/lifecycle_environment_paths': [:destroy] },
      resource_type: 'ForemanAnsibleDirector::LifecycleEnvironmentPath'
    # Promote
    permission :promote_ansible_lifecycle_environment_paths,
      { 'foreman_ansible_director/api/v2/lifecycle_environment_paths': [:promote] },
      resource_type: 'ForemanAnsibleDirector::LifecycleEnvironmentPath'
    ## Ansible Execution Environments
    # View
    permission :view_ansible_execution_environments,
      { 'foreman_ansible_director/api/v2/execution_environments': %i[index auto_complete_search show] },
      resource_type: 'ForemanAnsibleDirector::ExecutionEnvironment'
    # Create
    permission :create_ansible_execution_environments,
      { 'foreman_ansible_director/api/v2/execution_environments': [:create] },
      resource_type: 'ForemanAnsibleDirector::ExecutionEnvironment'
    # Edit
    permission :edit_ansible_execution_environments,
      { 'foreman_ansible_director/api/v2/execution_environments': [:update] },
      resource_type: 'ForemanAnsibleDirector::ExecutionEnvironment'
    # Destroy
    permission :destroy_ansible_execution_environments,
      { 'foreman_ansible_director/api/v2/execution_environments': [:destroy] },
      resource_type: 'ForemanAnsibleDirector::ExecutionEnvironment'
    ## Ansible assignments
    # View
    permission :view_ansible_assignments,
      { 'foreman_ansible_director/api/v2/assignments': %w[assignments preresolve] },
      resource_type: 'ForemanAnsibleDirector::AnsibleContentAssignment'
    # Create
    permission :create_ansible_assignments,
      { 'foreman_ansible_director/api/v2/assignments': %i[assign assign_bulk] },
      resource_type: 'ForemanAnsibleDirector::AnsibleContentAssignment'
    # Edit
    # Destroy
    permission :destroy_ansible_assignments,
      { 'foreman_ansible_director/api/v2/assignments': [:destroy] },
      resource_type: 'ForemanAnsibleDirector::AnsibleContentAssignment'

    role 'AnsibleDirector Viewer', %i[
      view_ansible_content
      view_ansible_director_variables
      view_ansible_director_variable_overrides
      view_ansible_lifecycle_environments
      view_ansible_lifecycle_environment_paths
      view_ansible_execution_environments
      view_ansible_assignments
    ], 'All read-only permissions defined by AnsibleDirector.'

    role 'AnsibleDirector Manager', %i[
      view_ansible_content
      create_ansible_content
      destroy_ansible_content
      view_ansible_director_variables
      edit_ansible_director_variables
      view_ansible_director_variable_overrides
      create_ansible_director_variable_overrides
      destroy_ansible_director_variable_overrides
      view_ansible_lifecycle_environments
      create_ansible_lifecycle_environments
      edit_ansible_lifecycle_environments
      destroy_ansible_lifecycle_environments
      view_ansible_lifecycle_environment_paths
      create_ansible_lifecycle_environment_paths
      edit_ansible_lifecycle_environment_paths
      destroy_ansible_lifecycle_environment_paths
      promote_ansible_lifecycle_environment_paths
      view_ansible_execution_environments
      create_ansible_execution_environments
      edit_ansible_execution_environments
      destroy_ansible_execution_environments
      view_ansible_assignments
      create_ansible_assignments
      destroy_ansible_assignments
    ], 'All permissions defined by AnsibleDirector.'

    add_all_permissions_to_default_roles
  end

  settings do
    category :ansible_director, 'Ansible Director' do
      setting 'ansible_director_default_galaxy_url',
        type: :string,
        description: 'Default URL used when importing content from an Ansible Galaxy instance.',
        default: ::ForemanAnsibleDirector::Constants::DEFAULT_GALAXY_URL,
        full_name: 'Content - Default Ansible Galaxy URL'
      setting 'ansible_director_default_ansible_core_version',
        type: :string,
        description: 'Default Ansible-Core version used for Execution Environments.
                       Must match an available release from PyPI
                       (check history: https://pypi.org/project/ansible-core/#history).',
        default: ::ForemanAnsibleDirector::Constants::DEFAULT_ANSIBLE_VERSION,
        full_name: 'Execution Environments - Default ansible-core version'
      setting 'ansible_director_default_ee_rex',
        type: :integer,
        description: 'Default Execution Environment used for execution of Remote Execution jobs.',
        default: nil,
        full_name: 'Execution Environments - Default Ansible Execution Environment for Remote Execution',
        collection: proc {
                      Hash[[[nil,
                             'No default Execution Environment']].concat(
                               ::ForemanAnsibleDirector::ExecutionEnvironment.unscoped.map do |ee|
                                 [ee.id, ee.name]
                               end
                             )
                      ]
                    }
      setting 'ansible_director_default_ee_internal',
        type: :integer,
        description: 'Default Execution Environment used for execution of default Ansible jobs.',
        default: nil,
        full_name: 'Execution Environments - Default Ansible Execution Environment for Ansible jobs',
        collection: proc {
                      Hash[[[nil,
                             'No default Execution Environment']].concat(
                               ::ForemanAnsibleDirector::ExecutionEnvironment.unscoped.map do |ee|
                                 [ee.id, ee.name]
                               end
                             )
                      ]
                    }
      setting 'ansible_director_lce_path_force_incremental',
        type: :boolean,
        description: 'When enabled, lifecycle environment promotions must follow the defined path incrementally
                      (e.g., DEV → TEST → PROD). When disabled, promotions can skip intermediate environments
                      (e.g., DEV → PROD directly, with implicit promotion of DEV → TEST).',
        default: true,
        full_name: 'Lifecycle environments - Force incremental promotion of lifecycle environments'
      setting 'ansible_director_lce_path_prevent_destruction_if_used',
        type: :boolean,
        description: 'When enabled, lifecycle environment paths can only be deleted if none of its lifecycle
                            environments is referenced anywhere.',
        default: true,
        full_name: 'Lifecycle environments - Prevent path deletion if lifecycle environment is in use.'
      setting 'ansible_director_pulp_batch_size',
        type: :integer,
        description: 'Run Pulp API calls in batches of size N.
                      The batch size is a trade-off between execution time and resource usage.',
        default: 200,
        full_name: 'Pulp API batch size'
      setting 'ansible_director_ui_refresh_interval',
        type: :integer,
        description: 'Refresh the UI every N seconds.
                            By default, Foreman updates the UI based on the state of running tasks every 5 seconds.',
        default: 5,
        full_name: 'UI - Refresh interval for running tasks'
      setting 'ansible_director_ui_search_cache_size',
        type: :integer,
        description: 'Certain search bars use a prefetched cache to reduce the time needed to perform a search.
                            This setting dictates the number of items prefetched into this cache.',
        default: 100,
        full_name: 'UI - Search cache size'
    end
  end

  ::Foreman::Plugin.app_metadata_registry.register(:foreman_ansible_director, {
    settings: lambda {
                {
                  ansible_director_default_galaxy_url:
                    Setting[:ansible_director_default_galaxy_url],
                  ansible_director_default_ansible_core_version:
                    Setting[:ansible_director_default_ansible_core_version],
                  ansible_director_ui_refresh_interval:
                    Setting[:ansible_director_ui_refresh_interval],
                  ansible_director_ui_search_cache_size:
                    Setting[:ansible_director_ui_search_cache_size],
                }
              },
  })

  register_global_js_file 'global'

  register_report_origin 'Ansible', 'ConfigReport'

  extend_rabl_template 'api/v2/hosts/main', '/api/v2/hosts/ansible_content_source'
  extend_rabl_template 'api/v2/hostgroups/main', '/api/v2/hosts/ansible_content_source'

  parameter_filter Host, :ansible_lifecycle_environment_id
  parameter_filter Hostgroup, :ansible_lifecycle_environment_id
  parameter_filter Hostgroup, :ansible_lifecycle_environment_state

  logger :crud, enabled: true
  logger :action, enabled: true

  extend_page 'hostgroups/_form' do |cx|
    cx.add_pagelet :main_tab_fields,
      id: :ansible_director_fields,
      resource_type: :hostgroup,
      partial: 'foreman_ansible_director/overrides/hostgroups_main_fields'
  end
end
