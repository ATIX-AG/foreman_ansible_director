# frozen_string_literal: true

require File.expand_path('lib/foreman_ansible_director/constants', __dir__)

Gem::Specification.new do |s|
  s.name        = 'foreman_ansible_director'
  s.version     = ForemanAnsibleDirector::Constants::PLUGIN_VERSION
  s.metadata    = { 'is_foreman_plugin' => 'true' }
  s.license     = 'GPL-3.0'
  s.authors     = ['Thorben Denzer']
  s.email       = ['denzer@atix.de']
  s.homepage    = 'https://www.atix.de'
  s.summary     = 'Summary of AnsibleDirector.'
  s.description = 'Description of AnsibleDirector.'

  s.files = Dir['{app,config,db,lib,locale,webpack}/**/*'] +
            %w[LICENSE Rakefile README.md package.json tsconfig.json]
  s.test_files = Dir['test/**/*'] + Dir['webpack/**/__tests__/*.js']

  s.required_ruby_version = '>= 3.0', '< 4'

  s.add_dependency 'dynflow', '>= 1.0.2', '< 2.0.0'
  s.add_dependency 'foreman_remote_execution', '~> 16.0'
  s.add_dependency 'foreman-tasks', '>= 8.3.0'
  s.add_dependency 'pulp_ansible_client', '>= 0.28.0', '< 0.29.0'
  s.add_dependency 'pulpcore_client', '>= 3.63.9', '< 3.73.16'


  s.add_development_dependency 'rdoc'
end
