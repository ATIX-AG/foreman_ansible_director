# frozen_string_literal: true

Foreman::Plugin.register :foreman_pulsible do
  requires_foreman '>= 3.12.0'
  register_gettext

  # TODO: Decide menu style

  sub_menu :top_menu, :ansible, caption: N_('Ansible'), after: :hosts_menu, icon: 'pficon pficon-in-progress' do
    menu :top_menu, :ansible_content,
      url: '/ansible/content',
      caption: 'Ansible Content'
    menu :top_menu, :ansible_environments,
      url: '/ansible/environments',
      caption: 'Ansible Environments'
  end

  divider :top_menu, caption: N_('Ansible'), parent: :configure_menu
  menu :top_menu, :ansible_content,
    url: '/ansible/content',
    caption: 'Ansible Content',
    parent: :configure_menu
  menu :top_menu, :ansible_environments,
    url: '/ansible/environments',
    caption: 'Ansible Environments',
    parent: :configure_menu

  register_global_js_file 'global'
end
