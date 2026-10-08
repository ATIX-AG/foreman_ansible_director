# frozen_string_literal: true

require 'foreman_ansible_director_test_helper'

module ForemanAnsibleDirectorTests
  module AnsibleContent
    module Unit
      class AnsibleContentHelpersTest < ForemanAnsibleDirectorTestCase
        def described_class
          ::ForemanAnsibleDirector::AnsibleContent::AnsibleContentHelpers
        end

        def create_content_unit_version(source_type: 'galaxy')
          collection = FactoryBot.create(:ansible_collection, organization: @organization)
          FactoryBot.create(:content_unit_version, versionable: collection, source_type: source_type)
        end

        describe '.decode_requirements_yml' do
          test 'decodes base64 requirements into parsed content units' do
            raw_yaml = <<~YAML
              ---
              collections:
                - name: theforeman.operations
                  version: 1.0.0
                  source: https://galaxy.example.com
              roles:
                - name: geerlingguy.redis
                  version: 2.0.0
                  source: https://galaxy.example.com
            YAML

            units = described_class.decode_requirements_yml(Base64.encode64(raw_yaml))

            assert_equal 2, units.length
            assert_equal :collection, units.first.unit_type
            assert_equal 'theforeman.operations', units.first.name
            assert_equal '1.0.0', units.first.version
            assert_equal :role, units.second.unit_type
            assert_equal 'geerlingguy.redis', units.second.name
            assert_equal '2.0.0', units.second.version
          end

          test 'decodes data uri requirements payload' do
            raw_yaml = <<~YAML
              ---
              collections:
                - name: theforeman.operations
            YAML
            encoded = "data:application/x-yaml;base64,#{Base64.encode64(raw_yaml)}"

            units = described_class.decode_requirements_yml(encoded)

            assert_equal 1, units.length
            assert_equal :collection, units.first.unit_type
            assert_equal 'theforeman.operations', units.first.name
          end
        end

        describe '.resolve_import_payload' do
          test 'builds simple content units from import payload' do
            units = described_class.resolve_import_payload(
              [
                {
                  unit_name: 'theforeman.operations',
                  unit_type: 'collection',
                  unit_source_type: 'galaxy',
                  unit_source: 'https://galaxy.example.com',
                  unit_versions: ['1.0.0'],
                },
              ]
            )

            assert_equal 1, units.length
            assert_equal :collection, units.first.unit_type
            assert_equal 'theforeman.operations', units.first.name
            assert_equal :galaxy, units.first.source_type
            assert_equal 'https://galaxy.example.com', units.first.source
            assert_equal ['1.0.0'], units.first.versions
          end

          test 'merges duplicate unit and source versions' do
            units = described_class.resolve_import_payload(
              [
                {
                  unit_name: 'theforeman.operations',
                  unit_type: 'collection',
                  unit_source_type: 'galaxy',
                  unit_source: 'https://galaxy.example.com',
                  unit_versions: ['1.0.0'],
                },
                {
                  unit_name: 'theforeman.operations',
                  unit_type: 'collection',
                  unit_source_type: 'galaxy',
                  unit_source: 'https://galaxy.example.com',
                  unit_versions: %w[1.0.0 2.0.0],
                },
              ]
            )

            assert_equal 1, units.length
            assert_equal %w[1.0.0 2.0.0], units.first.versions
          end

          test 'uses default galaxy url when source is missing' do
            with_setting_stub(setting: 'ansible_director_default_galaxy_url', value: 'https://galaxy.internal') do
              units = described_class.resolve_import_payload(
                [
                  {
                    unit_name: 'theforeman.operations',
                    unit_type: 'collection',
                    unit_source_type: 'galaxy',
                    unit_source: nil,
                    unit_versions: ['1.0.0'],
                  },
                ]
              )

              assert_equal 'https://galaxy.internal', units.first.source
            end
          end

          test 'allows non-semver versions for git content' do
            units = described_class.resolve_import_payload(
              [
                {
                  unit_name: 'theforeman.operations',
                  unit_type: 'collection',
                  unit_source_type: 'git',
                  unit_source: 'https://git.example.com/theforeman/operations.git',
                  unit_versions: ['main'],
                },
              ]
            )

            assert_equal :git, units.first.source_type
            assert_equal ['main'], units.first.versions
          end

          test 'raises for invalid galaxy version' do
            assert_raises(RuntimeError) do
              described_class.resolve_import_payload(
                [
                  {
                    unit_name: 'theforeman.operations',
                    unit_type: 'collection',
                    unit_source_type: 'galaxy',
                    unit_source: 'https://galaxy.example.com',
                    unit_versions: ['main'],
                  },
                ]
              )
            end
          end
        end

        describe '.resolve_destroy_payload' do
          test 'marks unit complete when no version ids are supplied' do
            version = create_content_unit_version
            unit = version.versionable

            result = described_class.resolve_destroy_payload([{ unit_id: unit.id }])

            assert_equal true, result[unit.id][:complete]
            assert_equal [], result[unit.id][:versions][:galaxy]
            assert_equal [], result[unit.id][:versions][:git]
          end

          test 'groups supplied versions by source type' do
            galaxy_version = create_content_unit_version(source_type: 'galaxy')
            unit = galaxy_version.versionable
            git_version = FactoryBot.create(:content_unit_version, versionable: unit, source_type: 'git')

            result = described_class.resolve_destroy_payload(
              [
                {
                  unit_id: unit.id,
                  unit_version_ids: [galaxy_version.id, git_version.id],
                },
              ]
            )

            assert_equal true, result[unit.id][:complete]
            assert_equal [galaxy_version.id], result[unit.id][:versions][:galaxy]
            assert_equal [git_version.id], result[unit.id][:versions][:git]
          end

          test 'keeps unit partial when only some versions are supplied' do
            supplied_version = create_content_unit_version(source_type: 'galaxy')
            unit = supplied_version.versionable
            FactoryBot.create(:content_unit_version, versionable: unit, source_type: 'galaxy')

            result = described_class.resolve_destroy_payload(
              [
                {
                  unit_id: unit.id,
                  unit_version_ids: [supplied_version.id],
                },
              ]
            )

            assert_equal false, result[unit.id][:complete]
            assert_equal [supplied_version.id], result[unit.id][:versions][:galaxy]
          end

          test 'raises when content unit is missing' do
            assert_raises(ActiveRecord::RecordNotFound) do
              described_class.resolve_destroy_payload([{ unit_id: -1 }])
            end
          end

          test 'raises when content unit version is missing' do
            version = create_content_unit_version

            assert_raises(ActiveRecord::RecordNotFound) do
              described_class.resolve_destroy_payload(
                [
                  {
                    unit_id: version.versionable.id,
                    unit_version_ids: [-1],
                  },
                ]
              )
            end
          end
        end
      end
    end
  end
end
