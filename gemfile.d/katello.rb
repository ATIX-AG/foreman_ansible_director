# frozen_string_literal: true

gem 'katello',
  git: ENV.fetch('KATELLO_SOURCE', 'https://github.com/Katello/katello.git'),
  ref: ENV.fetch('KATELLO_REF', 'master')
