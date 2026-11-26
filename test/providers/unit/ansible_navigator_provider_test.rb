# frozen_string_literal: true

require 'foreman_ansible_director_test_helper'

module ForemanAnsibleDirectorTests
  module Providers
    module Unit
      class AnsibleNavigatorProviderTest < ForemanAnsibleDirectorTestCase

        describe '#default_execution_environment' do
          test_as_admin 'returns nil when no ansible_director_default_ee parameter is set' do
            host = FactoryBot.create(:host, organization: @organization, name: 'testhost.example.com')

            result = ::ForemanAnsibleDirector::Actions::RemoteExecution::Provider::AnsibleNavigatorProvider
                       .default_execution_environment(host)
            assert_nil result
          end

          test_as_admin 'returns EE when parameter is set' do
            host = FactoryBot.create(:host, organization: @organization, name: 'testhost.example.com')
            ee = FactoryBot.create(:execution_environment, organization: @organization)
            FactoryBot.create(:host_parameter, host: host, name: 'ansible_director_default_ee_id', value: ee.id)

            result = ::ForemanAnsibleDirector::Actions::RemoteExecution::Provider::AnsibleNavigatorProvider
                       .default_execution_environment(host)
            assert_equal ee, result
          end

        end
      end
    end
  end
end
