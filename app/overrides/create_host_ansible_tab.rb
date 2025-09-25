# frozen_string_literal: true

Deface::Override.new(
  virtual_path: 'hosts/_form',
  name: 'ansible_content_tab_title',
  insert_after: 'li.active',
  partial: 'foreman_ansible_director/ansible_content/ansible_content_tab_title'
)

Deface::Override.new(
  virtual_path: 'hosts/_form',
  name: 'ansible_content_tab_content',
  insert_after: 'div.tab-pane.active',
  partial: 'foreman_ansible_director/ansible_content/ansible_content_tab_content'
)
