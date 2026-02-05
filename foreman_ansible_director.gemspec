# frozen_string_literal: true

require File.expand_path('lib/foreman_ansible_director/constants', __dir__)

Gem::Specification.new do |s|
  s.name        = 'foreman_ansible_director'
  s.version     = ::ForemanAnsibleDirector::Constants::PLUGIN_VERSION
  s.metadata    = { 'is_foreman_plugin' => 'true' }
  s.license     = 'GPL-3.0'
  s.authors     = ['ATIX AG']
  s.email       = ['info@atix.de']
  s.homepage    = 'https://www.atix.de'
  s.summary     = 'Advanced Ansible integration with Foreman and Katello.'
  s.description = 'Ansible support with Execution Environments, different Ansible/Python ' \
                  'versions and traditional Ansible features.'

  s.files = Dir['{app,config,db,lib,locale,webpack}/**/*'] +
            %w[LICENSE Rakefile README.md package.json tsconfig.json]
  s.test_files = Dir['test/**/*'] + Dir['webpack/**/__tests__/*.js']

  s.required_ruby_version = '>= 3.0', '< 4'

  s.add_dependency 'dynflow', '>= 1.6.1'
  s.add_dependency 'foreman_remote_execution', '>= 7.1.0', '< 16.3.0'
  s.add_dependency 'foreman-tasks', '>= 9.1'
  s.add_dependency 'pulp_ansible_client', '>= 0.24.1', '<= 0.25.0'
  s.add_dependency 'pulpcore_client', '>= 3.73.0', '< 3.74.0'

  s.add_dependency 'git', '>= 1.18.0', '< 3.0.0'

  s.add_development_dependency 'rdoc'
end
