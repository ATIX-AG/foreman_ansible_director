# frozen_string_literal: true

require 'foreman_ansible_director_test_helper'

module ForemanAnsibleDirectorTests
  module Services
    module Unit
      module Proxy
        class BaseClientTest < ForemanAnsibleDirectorTestCase

          describe 'BaseClient.new' do
            test 'uses the given proxy url' do
              proxy = FactoryBot.create(:smart_proxy)
              client = ::ForemanAnsibleDirector::Proxy::BaseClient.new(proxy)
              assert_equal proxy.url, client.url
            end

            test 'raises when no proxy is given' do
              assert_raises(ArgumentError) do
                ::ForemanAnsibleDirector::Proxy::BaseClient.new
              end
            end
          end
        end
      end
    end
  end
end
