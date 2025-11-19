# frozen_string_literal: true

Foreman::Plugin.register :foreman_ansible_director do
  requires_foreman '>= 3.12.0'
  register_gettext

  # TODO: Decide menu style

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

  register_global_js_file 'global'

  register_report_origin 'Ansible', 'ConfigReport'
  register_report_scanner ForemanAnsibleDirector::AnsibleReportScanner

  extend_rabl_template 'api/v2/hosts/main', '/api/v2/hosts/ansible_lifecycle_environment'
  parameter_filter Host, :ansible_lifecycle_environment_id
end
