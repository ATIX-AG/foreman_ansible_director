# frozen_string_literal: true

require File.expand_path('lib/foreman_ansible_director/constants', __dir__)

Gem::Specification.new do |s|
  s.name        = 'foreman_ansible_director'
  s.version     = ::ForemanAnsibleDirector::Constants::PLUGIN_VERSION
  s.metadata    = { 'is_foreman_plugin' => 'true' }
  s.license     = 'GPL-3.0-only'
  s.authors     = ['ATIX AG']
  s.email       = ['info@atix.de']
  s.homepage    = 'https://github.com/ATIX-AG/foreman_ansible_director'
  s.summary     = 'Advanced Ansible integration with Foreman and Katello.'
  s.description = 'Ansible support with Execution Environments, different Ansible/Python ' \
                  'versions and traditional Ansible features.'

  s.files = Dir['{app,config,db,lib,locale,webpack}/**/*'] +
            %w[LICENSE Rakefile README.md package.json tsconfig.json]
  s.test_files = Dir['test/**/*'] + Dir['webpack/**/__tests__/*.js']

  s.required_ruby_version = '>= 3.0', '< 4'

  s.add_dependency 'katello', '>= 4.20.0'

  s.add_dependency 'git', '>= 1.18.0', '< 3.0.0'

  s.add_development_dependency 'rdoc'
end
