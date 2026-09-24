# frozen_string_literal: true

# This calls the main test_helper in Foreman-core
require 'test_helper'

# "Borrowed" from foreman_rh_cloud
katello_files = Dir.glob("#{Katello::Engine.root}/test/factories/**/*.rb")
FactoryBot.definition_file_paths +=
  katello_files
    .map { |f| f.gsub('.rb', '') } # .rb extension is will be appended by factorybot

# Add plugin to FactoryBot's paths
FactoryBot.definition_file_paths << File.join(File.dirname(__FILE__), 'factories')
FactoryBot.reload


class ForemanAnsibleDirectorTestCase < ActiveSupport::TestCase
  def run(...)
    ::ForemanAnsibleDirector::RequestCtx::RequestContext.with_context(
      ::ForemanAnsibleDirector::RequestCtx::RequestContext.new(SecureRandom.uuid)
    ) do
      super()
    end
  end

  def ctx
    ::ForemanAnsibleDirector::RequestCtx::RequestContext.current
  end

  def with_setting_stub(setting:, value:)
    original = Setting[setting]
    Setting[setting] = value
    yield
  ensure
    Setting[setting] = original
  end

  setup do
    User.current = User.find_by(login: 'admin')
    @organization ||= Organization.find_by(name: 'Organization 1')
    Organization.current = @organization
  end
end