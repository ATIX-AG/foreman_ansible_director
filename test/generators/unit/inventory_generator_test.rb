# frozen_string_literal: true

require 'foreman_ansible_director_test_helper'

module ForemanAnsibleDirectorTests
  module Generators
    module Unit
      class InventoryGeneratorTest < ForemanAnsibleDirectorTestCase

        HOST_FQDN = 'testhost.example.com'
        HOST_ADDRESS = '192.168.121.42'

        OPTION_CHAINS = {
          ansible_user: {
            director_param: 'ansible_director_ansible_user',
            rex_param: 'remote_execution_ssh_user',
            job_method: :ssh_user,
          },
          ansible_become_user: {
            director_param: 'ansible_director_ansible_become_user',
            rex_param: 'remote_execution_effective_user',
            job_method: :effective_user,
          },
          ansible_port: {
            director_param: 'ansible_director_ansible_port',
            rex_param: 'remote_execution_ssh_port',
          },
          ansible_become_method: {
            director_param: 'ansible_director_ansible_become_method',
            rex_param: 'remote_execution_effective_user_method',
          },
          ansible_ssh_private_key_file: {
            director_param: 'ansible_director_ansible_ssh_private_key_file',
            rex_param: 'ansible_ssh_private_key_file',
          }
        }.freeze

        OPTION_CHAINS.each do |option_name, keys|
          describe "ansible_options: #{option_name}" do
            test_as_admin "#{option_name} uses ansible_director_#{option_name} param when nothing else is set" do
              host = FactoryBot.create(:host, organization: @organization, name: HOST_FQDN)
              FactoryBot.create(:host_parameter, host: host, name: keys[:director_param], value: 'director_value')

              inventory_hash, _ = ForemanAnsibleDirector::Generators::InventoryGenerator
                         .send(:ansible_options, host, nil)

              assert_equal 'director_value', inventory_hash[option_name]
            end

            test_as_admin "#{option_name} uses REX param when ansible_director_#{option_name} not set" do
              host = FactoryBot.create(:host, organization: @organization, name: HOST_FQDN)
              FactoryBot.create(:host_parameter, host: host, name: keys[:rex_param], value: 'rex_value')

              inventory_hash, _ = ForemanAnsibleDirector::Generators::InventoryGenerator
                         .send(:ansible_options, host, nil)

              assert_equal 'rex_value', inventory_hash[option_name]
            end

            test_as_admin "#{option_name}: ansible_director_#{option_name} overrides REX" do
              host = FactoryBot.create(:host, organization: @organization, name: HOST_FQDN)
              FactoryBot.create(:host_parameter, host: host, name: keys[:director_param], value: 'director_value')
              FactoryBot.create(:host_parameter, host: host, name: keys[:rex_param], value: 'rex_value')

              inventory_hash, _ = ForemanAnsibleDirector::Generators::InventoryGenerator
                         .send(:ansible_options, host, nil)

              assert_equal 'director_value', inventory_hash[option_name]
            end
          end
        end

        describe 'ansible_options: job_invocation overrides REX' do
          setup do
            @host = FactoryBot.create(:host, organization: @organization, name: HOST_FQDN)
            FactoryBot.create(:host_parameter, host: @host, name: 'remote_execution_ssh_user', value: 'rex_user')
            FactoryBot.create(:host_parameter, host: @host, name: 'remote_execution_effective_user', value: 'rex_sudo')
          end

          test_as_admin 'ansible_user uses job invocation ssh_user when REX param also set' do
            inner = stub(ssh_user: 'job_user')
            job_invocation = stub(job_invocation: inner, effective_user: 'rex_sudo')

            inventory_hash, _ = ForemanAnsibleDirector::Generators::InventoryGenerator
                       .send(:ansible_options, @host, job_invocation)

            assert_equal 'job_user', inventory_hash[:ansible_user]
          end

          test_as_admin 'ansible_become_user uses job invocation effective_user when REX param also set' do
            inner = stub(ssh_user: 'rex_user')
            job_invocation = stub(job_invocation: inner, effective_user: 'job_sudo')

            inventory_hash, _ = ForemanAnsibleDirector::Generators::InventoryGenerator
                       .send(:ansible_options, @host, job_invocation)

            assert_equal 'job_sudo', inventory_hash[:ansible_become_user]
          end

          test_as_admin 'ansible_user prefers job_invocation over ansible_director param' do
            FactoryBot.create(:host_parameter, host: @host, name: 'ansible_director_ansible_user', value: 'director_user')
            inner = stub(ssh_user: 'job_user')
            job_invocation = stub(job_invocation: inner, effective_user: nil)

            inventory_hash, _ = ForemanAnsibleDirector::Generators::InventoryGenerator
                       .send(:ansible_options, @host, job_invocation)

            assert_equal 'job_user', inventory_hash[:ansible_user]
          end
        end

        describe 'ansible_options: all four options combined' do
          setup do
            @host = FactoryBot.create(:host, organization: @organization, name: HOST_FQDN)
          end

          test_as_admin 'includes all present host parameters' do
            FactoryBot.create(:host_parameter, host: @host, name: 'ansible_director_ansible_user', value: 'director_user')
            FactoryBot.create(:host_parameter, host: @host, name: 'remote_execution_ssh_port', value: '2222')
            FactoryBot.create(:host_parameter, host: @host, name: 'remote_execution_effective_user_method', value: 'sudo')

            inventory_hash, _ = ForemanAnsibleDirector::Generators::InventoryGenerator
                       .send(:ansible_options, @host, nil)

            assert_equal 'director_user', inventory_hash[:ansible_user]
            assert_equal '2222', inventory_hash[:ansible_port]
            assert_equal 'sudo', inventory_hash[:ansible_become_method]
          end
        end

        describe 'ansible_options: ansible_become_user global setting fallback override' do
          setup do
            @host = FactoryBot.create(:host, organization: @organization, name: HOST_FQDN)
          end

          test_as_admin 'uses ansible_director_ansible_become_user when global setting matches REX fallback' do
            FactoryBot.create(:host_parameter, host: @host, name: 'ansible_director_ansible_become_user', value: 'director_sudo')
            with_setting_stub(setting: 'remote_execution_effective_user', value: 'rex_sudo') do
              inner = stub(ssh_user: nil)
              job_invocation = stub(job_invocation: inner, effective_user: 'rex_sudo')
              inventory_hash, _ = ForemanAnsibleDirector::Generators::InventoryGenerator
                         .send(:ansible_options, @host, job_invocation)

              assert_equal 'director_sudo', inventory_hash[:ansible_become_user]
            end
          end

          test_as_admin 'keeps REX param when no ansible_director_ansible_become_user is set' do
            FactoryBot.create(:host_parameter, host: @host, name: 'remote_execution_effective_user', value: 'default_sudo')
            with_setting_stub(setting: 'remote_execution_effective_user', value: 'default_sudo') do
              inventory_hash, _ = ForemanAnsibleDirector::Generators::InventoryGenerator
                         .send(:ansible_options, @host, nil)

              assert_equal 'default_sudo', inventory_hash[:ansible_become_user]
            end
          end

          test_as_admin 'keeps job_invocation effective_user even with global setting override logic' do
            FactoryBot.create(:host_parameter, host: @host, name: 'remote_execution_effective_user', value: 'default_sudo')
            FactoryBot.create(:host_parameter, host: @host, name: 'ansible_director_ansible_become_user', value: 'director_sudo')
            with_setting_stub(setting: 'remote_execution_effective_user', value: 'default_sudo') do
              inner = stub(ssh_user: nil)
              job_invocation = stub(job_invocation: inner, effective_user: 'job_sudo')

              inventory_hash, _ = ForemanAnsibleDirector::Generators::InventoryGenerator
                         .send(:ansible_options, @host, job_invocation)

              assert_equal 'job_sudo', inventory_hash[:ansible_become_user]
            end
          end
        end

        describe 'ansible_options: extra options' do
          setup do
            @host = FactoryBot.create(:host, organization: @organization, name: HOST_FQDN)
          end

          test_as_admin 'returns ansible_ssh_private_key_file extra option if applicable' do
            FactoryBot.create(:host_parameter, host: @host, name: 'ansible_ssh_private_key_file', value: 'SSH_KEY')

            _, options = ForemanAnsibleDirector::Generators::InventoryGenerator
                                  .send(:ansible_options, @host, nil)

            assert options.key?(:ansible_ssh_private_key_file)
            assert_equal 'SSH_KEY', options[:ansible_ssh_private_key_file]
          end

          test_as_admin 'returns empty hash by default' do
            _, options = ForemanAnsibleDirector::Generators::InventoryGenerator
                           .send(:ansible_options, @host, nil)

            assert_equal 0, options.keys.size
          end
        end

        describe 'ansible_options: ansible_become flag' do
          setup do
            @host = FactoryBot.create(:host, organization: @organization, name: HOST_FQDN)
          end

          test_as_admin 'sets ansible_become: true when become_user differs from user' do
            FactoryBot.create(:host_parameter, host: @host, name: 'remote_execution_ssh_user', value: 'deploy')
            FactoryBot.create(:host_parameter, host: @host, name: 'remote_execution_effective_user', value: 'root')

            inventory_hash, _ = ForemanAnsibleDirector::Generators::InventoryGenerator
                       .send(:ansible_options, @host, nil)

            assert_equal true, inventory_hash[:ansible_become]
            assert_equal 'root', inventory_hash[:ansible_become_user]
            assert_equal 'deploy', inventory_hash[:ansible_user]
          end

          test_as_admin 'does not set ansible_become when become_user equals user' do
            FactoryBot.create(:host_parameter, host: @host, name: 'remote_execution_ssh_user', value: 'root')
            FactoryBot.create(:host_parameter, host: @host, name: 'remote_execution_effective_user', value: 'root')

            inventory_hash, _ = ForemanAnsibleDirector::Generators::InventoryGenerator
                       .send(:ansible_options, @host, nil)

            assert_nil inventory_hash[:ansible_become]
          end

          test_as_admin 'does not set ansible_become when become_user is absent' do
            FactoryBot.create(:host_parameter, host: @host, name: 'remote_execution_ssh_user', value: 'deploy')

            inventory_hash, _ = ForemanAnsibleDirector::Generators::InventoryGenerator
                       .send(:ansible_options, @host, nil)

            assert_nil inventory_hash[:ansible_become]
          end
        end

        describe '#generate' do
          test_as_admin 'returns correct inventory structure' do
            host = FactoryBot.create(:host, organization: @organization, name: HOST_FQDN)
            job_invocation = stub(job_invocation: stub(ssh_user: nil, effective_user: nil), effective_user: nil)

            inventory_hash, _ = ForemanAnsibleDirector::Generators::InventoryGenerator.generate(
              host: host,
              host_address: HOST_ADDRESS,
              template_invocation: job_invocation,
            )

            assert inventory_hash.key?(host.name.to_sym)
            inner = inventory_hash[host.name.to_sym]
            assert_not_nil inner
            assert inner.key?(:hosts)
            assert inner[:hosts].key?(HOST_ADDRESS.to_sym)
          end

          test_as_admin 'includes ansible options in inventory structure' do
            host = FactoryBot.create(:host, organization: @organization, name: HOST_FQDN)
            FactoryBot.create(:host_parameter, host: host, name: 'remote_execution_ssh_port', value: '2222')
            inner = stub(ssh_user: 'rex_user',)
            job_invocation = stub(job_invocation: inner, effective_user: nil)

            inventory_hash, _ = ForemanAnsibleDirector::Generators::InventoryGenerator.generate(
              host: host,
              host_address: HOST_ADDRESS,
              template_invocation: job_invocation,
            )

            assert_equal 'rex_user', inventory_hash[host.name.to_sym][:hosts][HOST_ADDRESS.to_sym][:ansible_user]
            assert_equal '2222', inventory_hash[host.name.to_sym][:hosts][HOST_ADDRESS.to_sym][:ansible_port]
          end

          test_as_admin 'keyed by actual host name' do
            host = FactoryBot.create(:host, organization: @organization, name: HOST_FQDN)
            job_invocation = stub(job_invocation: stub(ssh_user: nil, effective_user: nil), effective_user: nil)

            inventory_hash, _ = ForemanAnsibleDirector::Generators::InventoryGenerator.generate(
              host: host,
              host_address: HOST_ADDRESS,
              template_invocation: job_invocation,
            )

            assert inventory_hash.key?(host.name.to_sym)
          end
        end
      end
    end
  end
end
