# frozen_string_literal: true

gem 'katello', github: ENV.fetch('KATELLO_SOURCE', 'Katello/katello'), ref: ENV.fetch('KATELLO_REF', 'master')
