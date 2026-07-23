# frozen_string_literal: true

Deface::Override.new(
  virtual_path: 'hosts/_form',
  name: 'host_ansible_director_tab',
  insert_after: "ul.nav-tabs[data-tabs='tabs'] > li:nth-of-type(2)",
  partial: 'foreman_ansible_director/overrides/hosts_tab_title'
)

Deface::Override.new(
  virtual_path: 'hosts/_form',
  name: 'host_ansible_director_tab_content',
  insert_after: 'div.tab-pane#network',
  partial: 'foreman_ansible_director/overrides/hosts_tab_content'
)
