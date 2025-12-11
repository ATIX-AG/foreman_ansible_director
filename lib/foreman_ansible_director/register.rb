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
      { 'foreman_ansible_director/api/v2/ansible_content': %i[index version_detail],
        'foreman_ansible_director/api/v2/status': %i[content context] },
      resource_type: 'ContentUnit'
    # Create
    permission :create_ansible_content,
      { 'foreman_ansible_director/api/v2/ansible_content': [:create_units] },
      resource_type: 'ContentUnit'
    # Edit
    # Destroy
    permission :destroy_ansible_content,
      { 'foreman_ansible_director/api/v2/ansible_content': [:destroy_units] },
      resource_type: 'ContentUnit'
    ## Ansible Variables
    # View
    permission :view_ansible_variables,
      { 'foreman_ansible_director/api/v2/ansible_variables': %i[show index] },
      resource_type: 'AnsibleVariable'
    # Edit
    permission :edit_ansible_variables,
      { 'foreman_ansible_director/api/v2/ansible_variables': [:update] },
      resource_type: 'AnsibleVariable'
    # Destroy
    ## Ansible Variable Overrides
    # View
    permission :view_ansible_variable_overrides,
      { 'foreman_ansible_director/api/v2/ansible_variable_overrides': [:index_for_target] },
      resource_type: 'LookupValue'
    # Create
    permission :create_ansible_variable_overrides,
      { 'foreman_ansible_director/api/v2/ansible_variable_overrides': [:create] },
      resource_type: 'LookupValue'
    # Edit
    permission :edit_ansible_variable_overrides,
      { 'foreman_ansible_director/api/v2/ansible_variable_overrides': [:update] },
      resource_type: 'LookupValue'
    # Destroy
    permission :destroy_ansible_variable_overrides,
      { 'foreman_ansible_director/api/v2/ansible_variable_overrides': [:destroy] },
      resource_type: 'LookupValue'
    # Ansible Lifecycle Environments
    # View
    permission :view_ansible_lifecycle_environments,
      { 'foreman_ansible_director/api/v2/lifecycle_environments': %i[show content] },
      resource_type: 'LifecycleEnvironment'
    # Create
    permission :create_ansible_lifecycle_environments,
      { 'foreman_ansible_director/api/v2/lifecycle_environments': [:create] },
      resource_type: 'LifecycleEnvironment'
    # Edit
    permission :edit_ansible_lifecycle_environments,
      { 'foreman_ansible_director/api/v2/lifecycle_environments': %i[update update_content assign] },
      resource_type: 'LifecycleEnvironment'
    # Destroy
    permission :destroy_ansible_lifecycle_environments,
      { 'foreman_ansible_director/api/v2/lifecycle_environments': [:destroy] },
      resource_type: 'LifecycleEnvironment'
    ## Ansible Lifecycle Environment Paths
    # View
    permission :view_ansible_lifecycle_environment_paths,
      { 'foreman_ansible_director/api/v2/lifecycle_environment_paths': [:index] },
      resource_type: 'LifecycleEnvironmentPath'
    # Create
    permission :create_ansible_lifecycle_environment_paths,
      { 'foreman_ansible_director/api/v2/lifecycle_environment_paths': [:create] },
      resource_type: 'LifecycleEnvironmentPath'
    # Edit
    permission :edit_ansible_lifecycle_environment_paths,
      { 'foreman_ansible_director/api/v2/lifecycle_environment_paths': [:update] },
      resource_type: 'LifecycleEnvironmentPath'
    # Destroy
    permission :destroy_ansible_lifecycle_environment_paths,
      { 'foreman_ansible_director/api/v2/lifecycle_environment_paths': [:destroy] },
      resource_type: 'LifecycleEnvironmentPath'
    # Promote
    permission :promote_ansible_lifecycle_environment_paths,
      { 'foreman_ansible_director/api/v2/lifecycle_environment_paths': [:promote] },
      resource_type: 'LifecycleEnvironmentPath'
    ## Ansible Execution Environments
    # View
    permission :view_ansible_execution_environments,
      { 'foreman_ansible_director/api/v2/execution_environments': [:index] },
      resource_type: 'ExecutionEnvironment'
    # Create
    permission :create_ansible_execution_environments,
      { 'foreman_ansible_director/api/v2/execution_environments': [:create] },
      resource_type: 'ExecutionEnvironment'
    # Edit
    permission :edit_ansible_execution_environments,
      { 'foreman_ansible_director/api/v2/execution_environments': [:update] },
      resource_type: 'ExecutionEnvironment'
    # Destroy
    permission :destroy_ansible_execution_environments,
      { 'foreman_ansible_director/api/v2/execution_environments': [:destroy] },
      resource_type: 'ExecutionEnvironment'
    ## Ansible assignments
    # View
    permission :view_ansible_assignments,
      { 'foreman_ansible_director/api/v2/assignments': [:assignments] },
      resource_type: 'AnsibleContentAssignment'
    # Create
    permission :create_ansible_assignments,
      { 'foreman_ansible_director/api/v2/assignments': %i[assign assign_bulk] },
      resource_type: 'AnsibleContentAssignment'
    # Edit
    # Destroy
    permission :destroy_ansible_assignments,
      { 'foreman_ansible_director/api/v2/assignments': [:destroy] },
      resource_type: 'AnsibleContentAssignment'
  end

  settings do
    category :ansible_director, 'Ansible Director' do
      setting 'ad_default_galaxy_url',
        type: :string,
        description: 'Default URL used when importing content from an Ansible Galaxy instance.',
        default: ::ForemanAnsibleDirector::Constants::DEFAULT_GALAXY_URL,
        full_name: 'Content - Default Ansible Galaxy URL'
      setting 'ad_content_import_override',
        type: :boolean,
        description: 'When enabled, the content importer will override any existing content that matches the identifier
                       of a content unit scheduled for import, ensuring the new content replaces the existing version
                       rather than being skipped.',
        default: false,
        full_name: 'Content - Force override of existing content'
      setting 'ad_default_ansible_core_version',
        type: :string,
        description: 'Default Ansible-Core version used for execution environments.
                       Must match an available release from PyPI
                       (check history: https://pypi.org/project/ansible-core/#history).',
        default: ::ForemanAnsibleDirector::Constants::DEFAULT_ANSIBLE_VERSION,
        full_name: 'Execution Environments - Default ansible-core version'
      setting 'ad_default_ee_rex',
        type: :integer,
        description: 'Default Execution Environment used for execution of Remote Execution jobs.',
        default: 0,
        full_name: 'Execution Environments - Default Ansible Execution Environment for Remote Execution',
        collection: proc { Hash[::ForemanAnsibleDirector::ExecutionEnvironment.unscoped.map { |ee| [ee.id, ee.name] }] }
      setting 'ad_default_ee_internal',
        type: :integer,
        description: 'Default Execution Environment used for execution of default Ansible jobs.',
        default: 0,
        full_name: 'Execution Environments - Default Ansible Execution Environment for Ansible jobs',
        collection: proc { Hash[::ForemanAnsibleDirector::ExecutionEnvironment.unscoped.map { |ee| [ee.id, ee.name] }] }
      setting 'ad_lce_path_force_incremental',
        type: :boolean,
        description: 'When enabled, lifecycle environment promotions must follow the defined path incrementally
                      (e.g., DEV → TEST → PROD). When disabled, promotions can skip intermediate environments
                      (e.g., DEV → PROD directly, with implicit promotion of DEV → TEST).',
        default: true,
        full_name: 'Lifecycle Environments - Force incremental promotion of lifecycle environments'
      setting 'ad_lce_path_prevent_destruction_if_used',
        type: :boolean,
        description: 'When enabled, lifecycle environment paths can only be destroyed if none of its lifecycle
                            environments is referenced anywhere.',
        default: true,
        full_name: 'Lifecycle Environments - Prevent path destruction if lifecycle environment is in use.'
    end
  end

  register_global_js_file 'global'

  register_report_origin 'Ansible', 'ConfigReport'

  extend_rabl_template 'api/v2/hosts/main', '/api/v2/hosts/ansible_lifecycle_environment'
  parameter_filter Host, :ansible_lifecycle_environment_id
end
