# frozen_string_literal: true

require 'rake/testtask'

# Tests
namespace :test do
  desc 'Test ForemanAnsibleDirector'
  Rake::TestTask.new(:foreman_ansible_director) do |t|
    test_dir = File.expand_path('../../test', __dir__)
    t.libs << 'test'
    t.libs << test_dir
    t.pattern = "#{test_dir}/**/*_test.rb"
    t.verbose = true
    t.warning = false
  end

  namespace :foreman_ansible_director do
    # Subtask for execution of the Foreman(!) AccessPermissionsTest
    desc 'AccessPermissionsTest'
    Rake::TestTask.new(:access_permissions_test) do |t|
      t.libs << 'test'
      t.test_files = [Rails.root.join('test/unit/foreman/access_permissions_test.rb')]
      t.verbose = true
      t.warning = false
    end
  end
end

Rake::Task[:test].enhance ['test:foreman_ansible_director']

load 'tasks/jenkins.rake'
if Rake::Task.task_defined?(:'jenkins:unit')
  Rake::Task['jenkins:unit'].enhance ['test:foreman_ansible_director', 'foreman_ansible_director:rubocop']
end
