require File.expand_path('lib/foreman_pulsible/constants', __dir__)

Gem::Specification.new do |s|
  s.name        = 'foreman_pulsible'
  s.version     = ForemanPulsible::Constants::PLUGIN_VERSION
  s.metadata    = { 'is_foreman_plugin' => 'true' }
  s.license     = 'GPL-3.0'
  s.authors     = ['Your name']
  s.email       = ['Your email']
  s.homepage    = ''
  s.summary     = 'Summary of ForemanPluginTemplate.'
  # also update locale/gemspec.rb
  s.description = 'Description of ForemanPluginTemplate.'

  s.files = Dir['{app,config,db,lib,locale,webpack}/**/*'] + ['LICENSE', 'Rakefile', 'README.md', 'package.json']
  s.test_files = Dir['test/**/*'] + Dir['webpack/**/__tests__/*.js']

  s.required_ruby_version = '>= 2.7', '< 4'

  s.add_dependency 'dynflow', '>= 1.0.2', '< 2.0.0'
  s.add_dependency 'foreman-tasks', '>= 8.3.0'

  s.add_development_dependency 'rdoc'
end
