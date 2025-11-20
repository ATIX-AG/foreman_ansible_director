# frozen_string_literal: true

Foreman::Plugin.register :foreman_ansible_director do
  requires_foreman '>= 3.12.0'
  register_gettext

  sub_menu :top_menu, :ansible, caption: N_('Ansible'), after: :hosts_menu, icon: 'pficon pficon-in-progress' do
    menu :top_menu, :ansible_content,
      url: '/ansible/content',
      caption: 'Ansible Content'
    menu :top_menu, :ansible_execution_environments,
      url: '/ansible/execution_environments',
      caption: 'Ansible Execution Environments'
    menu :top_menu, :ansible_environments,
      url: '/ansible/environments',
      caption: 'Ansible Environments'
  end

  security_block :foreman_ansible_director do
    ## Ansible Content
    # View
    permission :view_ansible_content,
      { 'api/v2/ansible_content': %i[index version_detail] },
      resource_type: 'ContentUnit'
    # Create
    permission :create_ansible_content,
      { 'api/v2/ansible_content': [:create_units] },
      resource_type: 'ContentUnit'
    # Edit
    # Destroy
    permission :destroy_ansible_content,
      { 'api/v2/ansible_content': [:destroy_units],
        'api/v2/status': [:content] },
      resource_type: 'ContentUnit'
    ## Ansible Variables
    # View
    permission :view_ansible_variables,
      { 'api/v2/ansible_variables': %i[show index] },
      resource_type: 'AnsibleVariable'
    # Edit
    permission :edit_ansible_variables,
      { 'api/v2/ansible_variables': [:update] },
      resource_type: 'AnsibleVariable'
    # Destroy
    ## Ansible Variable Overrides
    # View
    permission :view_ansible_variable_overrides,
      { 'api/v2/ansible_variable_overrides': [:index_for_target] },
      resource_type: 'LookupValue'
    # Create
    permission :create_ansible_variable_overrides,
      { 'api/v2/ansible_variable_overrides': [:create] },
      resource_type: 'LookupValue'
    # Edit
    permission :edit_ansible_variable_overrides,
      { 'api/v2/ansible_variable_overrides': [:update] },
      resource_type: 'LookupValue'
    # Destroy
    permission :destroy_ansible_variable_overrides,
      { 'api/v2/ansible_variable_overrides': [:destroy] },
      resource_type: 'LookupValue'
    # Ansible Lifecycle Environments
    # View
    permission :view_ansible_lifecycle_environments,
      { 'api/v2/lifecycle_environments': %i[show content] },
      resource_type: 'LifecycleEnvironment'
    # Create
    permission :create_ansible_lifecycle_environments,
      { 'api/v2/lifecycle_environments': [:create] },
      resource_type: 'LifecycleEnvironment'
    # Edit
    permission :edit_ansible_lifecycle_environments,
      { 'api/v2/lifecycle_environments': %i[update update_content assign] },
      resource_type: 'LifecycleEnvironment'
    # Destroy
    permission :destroy_ansible_lifecycle_environments,
      { 'api/v2/lifecycle_environments': [:destroy] },
      resource_type: 'LifecycleEnvironment'
    ## Ansible Lifecycle Environment Paths
    # View
    permission :view_ansible_lifecycle_environment_paths,
      { 'api/v2/lifecycle_environment_paths': [:index] },
      resource_type: 'LifecycleEnvironmentPath'
    # Create
    permission :create_ansible_lifecycle_environment_paths,
      { 'api/v2/lifecycle_environment_paths': [:create] },
      resource_type: 'LifecycleEnvironmentPath'
    # Edit
    permission :edit_ansible_lifecycle_environment_paths,
      { 'api/v2/lifecycle_environment_paths': [:update] },
      resource_type: 'LifecycleEnvironmentPath'
    # Destroy
    permission :destroy_ansible_lifecycle_environment_paths,
      { 'api/v2/lifecycle_environment_paths': [:destroy] },
      resource_type: 'LifecycleEnvironmentPath'
    # Promote
    permission :promote_ansible_lifecycle_environment_paths,
      { 'api/v2/lifecycle_environment_paths': [:promote] },
      resource_type: 'LifecycleEnvironmentPath'
    ## Ansible Execution Environments
    # View
    permission :view_ansible_execution_environments,
      { 'api/v2/execution_environments': [:index] },
      resource_type: 'ExecutionEnvironment'
    # Create
    permission :create_ansible_execution_environments,
      { 'api/v2/execution_environments': [:create] },
      resource_type: 'ExecutionEnvironment'
    # Edit
    permission :view_ansible_execution_environments,
      { 'api/v2/execution_environments': [:update] },
      resource_type: 'ExecutionEnvironment'
    # Destroy
    permission :destroy_ansible_execution_environments,
      { 'api/v2/execution_environments': [:destroy] },
      resource_type: 'ExecutionEnvironment'
    ## Ansible assignments
    # View
    permission :view_ansible_assignments,
      { 'api/v2/assignments': [:assignments] },
      resource_type: 'AnsibleContentAssignment'
    # Create
    permission :create_ansible_assignments,
      { 'api/v2/assignments': %i[assign assign_bulk] },
      resource_type: 'AnsibleContentAssignment'
    # Edit
    # Destroy
    permission :destroy_ansible_assignments,
      { 'api/v2/assignments': [:destroy] },
      resource_type: 'AnsibleContentAssignment'
  end

  register_global_js_file 'global'

  register_report_origin 'Ansible', 'ConfigReport'

  extend_rabl_template 'api/v2/hosts/main', '/api/v2/hosts/ansible_lifecycle_environment'
  parameter_filter Host, :ansible_lifecycle_environment_id
end
