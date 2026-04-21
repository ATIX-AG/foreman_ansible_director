# frozen_string_literal: true

require 'foreman_ansible_director_test_helper'

module ForemanAnsibleDirectorTests
  module AnsibleContent
    module Unit
      class SimpleAnsibleContentUnitTest < ForemanAnsibleDirectorTestCase

        def described_class
          ::ForemanAnsibleDirector::AnsibleContent::SimpleAnsibleContentUnit
        end

        describe '#initialize' do
          test 'initializes with required attributes' do
            sacu = described_class.new(
              unit_type: :collection,
              unit_name: 'theforeman.operations',
              unit_versions: ['1.0.0'],
              unit_source_type: 'galaxy',
              unit_source: 'https://galaxy.ansible.com',
            )

            assert_equal :collection, sacu.unit_type
            assert_equal :collection, sacu.type
            assert_equal 'theforeman.operations', sacu.name
            assert_equal ['1.0.0'], sacu.versions
            assert_equal 'galaxy', sacu.source_type
            assert_equal 'https://galaxy.ansible.com', sacu.source
          end

          test 'defaults unit_source to Setting[:ansible_director_default_galaxy_url] if not provided' do
            with_setting_stub(setting: 'ansible_director_default_galaxy_url', value: 'https://my.galaxy.internal') do
              unit = described_class.new(
                unit_type: :collection,
                unit_name: 'foo.bar'
              )
              assert_equal 'https://my.galaxy.internal', unit.source
            end
          end

          test 'defaults unit_versions to empty array' do
            unit = described_class.new(unit_type: :collection, unit_name: 'foo.bar')
            assert_equal [], unit.versions
          end
        end

        describe '#unit_name' do
          test 'extracts name part from FQCN' do
            unit = described_class.new(unit_name: 'theforeman.operations')
            assert_equal 'operations', unit.unit_name
          end
        end

        describe '#unit_namespace' do
          test 'extracts namespace part from FQCN' do
            unit = described_class.new(unit_name: 'theforeman.operations')
            assert_equal 'theforeman', unit.unit_namespace
          end
        end

        describe '#collection_file' do
          test 'returns YAML for collection with one version' do
            unit = described_class.new(
              unit_type: :collection,
              unit_name: 'theforeman.operations',
              unit_versions: ['1.0.0'],
              unit_source: 'https://galaxy.ansible.com',
              unit_source_type: 'galaxy'
            )

            expected_yaml = <<~YAML
              ---
              collections:
              - name: theforeman.operations
                version: 1.0.0
                source: https://galaxy.ansible.com
            YAML
            assert_equal expected_yaml, unit.collection_file
          end

          test 'returns YAML for collection with multiple versions' do
            unit = described_class.new(
              unit_type: :collection,
              unit_name: 'theforeman.operations',
              unit_versions: %w[1.0.0 2.0.0],
              unit_source: 'https://galaxy.ansible.com',
              unit_source_type: 'galaxy'
            )

            expected_yaml = <<~YAML
              ---
              collections:
              - name: theforeman.operations
                version: 1.0.0
                source: https://galaxy.ansible.com
              - name: theforeman.operations
                version: 2.0.0
                source: https://galaxy.ansible.com
            YAML
            assert_equal expected_yaml, unit.collection_file
          end

          test 'returns nil if unit_type is not :collection' do
            unit = described_class.new(unit_type: :role, unit_name: 'foo.bar')
            assert_nil unit.collection_file
          end
        end

        describe '#role_url' do
          test 'returns correct role URL when source ends with a trailing slash' do
            unit = described_class.new(
              unit_type: :role,
              unit_name: 'geerlingguy.redis',
              unit_source: 'https://galaxy.ansible.com/'
            )
            expected = "https://galaxy.ansible.com/api/v1/roles/?namespace=geerlingguy&name=redis"
            assert_equal expected, unit.role_url
          end

          test 'returns correct role URL when source does not end with a trailing slash' do
            unit = described_class.new(
              unit_type: :role,
              unit_name: 'geerlingguy.redis',
              unit_source: 'https://galaxy.ansible.com'
            )
            expected = "https://galaxy.ansible.com/api/v1/roles/?namespace=geerlingguy&name=redis"
            assert_equal expected, unit.role_url
          end

          test 'returns nil if unit_type is not :role' do
            unit = described_class.new(unit_type: :collection, unit_name: 'foo.bar')
            assert_nil unit.role_url
          end
        end

        describe '#to_hash' do
          test 'returns hash representation of all attributes' do
            unit = described_class.new(
              unit_type: :collection,
              unit_name: 'theforeman.operations',
              unit_versions: ['1.0.0'],
              unit_source: 'https://galaxy.example.com',
              unit_source_type: 'galaxy',
              unit_src: 'some/path',
              unit_scm: 'git'
            )

            hash = unit.to_hash

            assert_equal :collection, hash[:unit_type]
            assert_equal 'theforeman.operations', hash[:unit_name]
            assert_equal ['1.0.0'], hash[:versions]
            assert_equal 'https://galaxy.example.com', hash[:source]
            assert_equal 'galaxy', hash[:source_type]
            assert_equal :collection, hash[:type]
            assert_equal 'some/path', hash[:src]
            assert_equal('git', hash[:scm])
          end
        end
      end
    end
  end
end
