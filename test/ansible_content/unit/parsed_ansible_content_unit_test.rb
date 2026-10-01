# frozen_string_literal: true

require 'foreman_ansible_director_test_helper'

module ForemanAnsibleDirectorTests
  module AnsibleContent
    module Unit
      class ParsedAnsibleContentUnitTest < ForemanAnsibleDirectorTestCase
        def described_class
          ::ForemanAnsibleDirector::AnsibleContent::ParsedAnsibleContentUnit
        end

        describe '#initialize' do
          test 'initializes collection attributes from requirements entry' do
            unit = described_class.new(
              :collection,
              'name' => 'theforeman.operations',
              'version' => '1.0.0',
              'source' => 'https://galaxy.example.com',
              'type' => 'galaxy'
            )

            assert_equal :collection, unit.unit_type
            assert_equal 'theforeman.operations', unit.name
            assert_equal '1.0.0', unit.version
            assert_equal 'https://galaxy.example.com', unit.source
            assert_equal 'galaxy', unit.type
          end

          test 'defaults source to configured galaxy url' do
            with_setting_stub(setting: 'ansible_director_default_galaxy_url', value: 'https://galaxy.internal') do
              unit = described_class.new(:collection, 'name' => 'theforeman.operations')

              assert_equal 'https://galaxy.internal', unit.source
            end
          end
        end

        describe '#git?' do
          test 'returns true for git collection entries' do
            unit = described_class.new(
              :collection,
              'name' => 'theforeman.operations',
              'type' => 'git'
            )

            assert unit.git?
          end

          test 'returns true for git role entries' do
            unit = described_class.new(
              :role,
              'name' => 'geerlingguy.redis',
              'scm' => 'git'
            )

            assert unit.git?
          end

          test 'returns nil for non-git entries' do
            collection = described_class.new(
              :collection,
              'name' => 'theforeman.operations',
              'type' => 'galaxy'
            )
            role = described_class.new(
              :role,
              'name' => 'geerlingguy.redis'
            )

            assert_nil collection.git?
            assert_nil role.git?
          end
        end

        describe '#name' do
          test 'returns explicit name when present' do
            unit = described_class.new(
              :collection,
              'name' => 'theforeman.operations',
              'source' => 'https://example.com/ignored'
            )

            assert_equal 'theforeman.operations', unit.name
          end

          test 'infers collection name from source when name is missing' do
            unit = described_class.new(
              :collection,
              'source' => 'https://git.example.com/acme.redis.git'
            )

            assert_equal 'acme.redis', unit.name
          end

          test 'infers role name from src when name is missing' do
            unit = described_class.new(
              :role,
              'src' => 'https://git.example.com/acme.redis.git'
            )

            assert_equal 'acme.redis', unit.name
          end
        end

        describe '#unit_name' do
          test 'returns name part from fully qualified content name' do
            unit = described_class.new(:collection, 'name' => 'theforeman.operations')

            assert_equal 'operations', unit.unit_name
          end
        end

        describe '#unit_namespace' do
          test 'returns namespace part from fully qualified content name' do
            unit = described_class.new(:collection, 'name' => 'theforeman.operations')

            assert_equal 'theforeman', unit.unit_namespace
          end
        end

        describe '#role_url' do
          test 'builds galaxy role lookup url for roles' do
            unit = described_class.new(:role, 'name' => 'geerlingguy.redis')

            expected = 'https://galaxy.ansible.com/api/v1/roles/?owner__username=geerlingguy&name=redis'
            assert_equal expected, unit.role_url
          end

          test 'returns nil for collections' do
            unit = described_class.new(:collection, 'name' => 'theforeman.operations')

            assert_nil unit.role_url
          end
        end

        describe '#collection_file' do
          test 'builds requirements yaml for collection entries' do
            unit = described_class.new(
              :collection,
              'name' => 'theforeman.operations',
              'version' => '1.0.0',
              'source' => 'https://galaxy.example.com',
              'type' => 'galaxy'
            )

            result = YAML.safe_load(unit.collection_file)

            assert_equal(
              [
                {
                  'name' => 'theforeman.operations',
                  'version' => '1.0.0',
                  'source' => 'https://galaxy.example.com',
                  'type' => 'galaxy',
                },
              ],
              result['collections']
            )
          end

          test 'returns nil for roles' do
            unit = described_class.new(:role, 'name' => 'geerlingguy.redis')

            assert_nil unit.collection_file
          end
        end
      end
    end
  end
end
