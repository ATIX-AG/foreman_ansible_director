require 'foreman_ansible_director_test_helper'

module ForemanAnsibleDirectorTests
  module Models
    module Unit
      class AnsibleCollectionTest < ForemanAnsibleDirectorTestCase
        setup do
          @collection = FactoryBot.create(
            :ansible_collection,
            name: 'operations',
            namespace: 'theforeman',
            organization: @organization
          )
        end

        test 'requirements_file includes galaxy content versions' do
          FactoryBot.create(
            :content_unit_version,
            versionable: @collection,
            source_type: 'galaxy',
            source: 'https://galaxy.example.com',
            version: '1.0.0'
          )
          FactoryBot.create(
            :content_unit_version,
            versionable: @collection,
            source_type: 'git',
            source: 'https://git.example.com/theforeman/operations.git',
            version: 'main'
          )

          requirements = YAML.safe_load(@collection.requirements_file)

          assert_equal(
            [
              {
                'name' => 'theforeman.operations',
                'version' => '1.0.0',
                'source' => 'https://galaxy.example.com',
              },
            ],
            requirements.fetch('collections')
          )
        end

        test 'requirements_file appends simple content unit versions' do
          simple_unit = simple_content_unit(unit_versions: %w[1.1.0 1.2.0])

          requirements = YAML.safe_load(@collection.requirements_file(simple_unit))

          assert_equal(
            [
              {
                'name' => 'theforeman.operations',
                'version' => '1.1.0',
                'source' => 'https://galaxy.example.com',
              },
              {
                'name' => 'theforeman.operations',
                'version' => '1.2.0',
                'source' => 'https://galaxy.example.com',
              },
            ],
            requirements.fetch('collections')
          )
        end

        test 'requirements_file appends simple content unit without versions' do
          simple_unit = simple_content_unit(unit_versions: [])

          requirements = YAML.safe_load(@collection.requirements_file(simple_unit))

          assert_equal(
            [
              {
                'name' => 'theforeman.operations',
                'source' => 'https://galaxy.example.com',
              },
            ],
            requirements.fetch('collections')
          )
        end

        test 'requirements_file subtracts simple content unit versions' do
          FactoryBot.create(
            :content_unit_version,
            versionable: @collection,
            source_type: 'galaxy',
            source: 'https://galaxy.example.com',
            version: '1.0.0'
          )
          FactoryBot.create(
            :content_unit_version,
            versionable: @collection,
            source_type: 'galaxy',
            source: 'https://galaxy.example.com',
            version: '1.1.0'
          )
          simple_unit = simple_content_unit(unit_versions: ['1.0.0'])

          requirements = YAML.safe_load(@collection.requirements_file(simple_unit, subtractive: true))

          assert_equal(
            [
              {
                'name' => 'theforeman.operations',
                'version' => '1.1.0',
                'source' => 'https://galaxy.example.com',
              },
            ],
            requirements.fetch('collections')
          )
        end

        test 'requirements_file subtracts nothing when simple content unit has no versions' do
          FactoryBot.create(
            :content_unit_version,
            versionable: @collection,
            source_type: 'galaxy',
            source: 'https://galaxy.example.com',
            version: '1.0.0'
          )
          simple_unit = simple_content_unit(unit_versions: [])

          requirements = YAML.safe_load(@collection.requirements_file(simple_unit, subtractive: true))

          assert_equal(
            [
              {
                'name' => 'theforeman.operations',
                'version' => '1.0.0',
                'source' => 'https://galaxy.example.com',
              },
            ],
            requirements.fetch('collections')
          )
        end

        private

        def simple_content_unit(unit_versions:)
          ::ForemanAnsibleDirector::AnsibleContent::SimpleAnsibleContentUnit.new(
            unit_type: :collection,
            unit_name: 'theforeman.operations',
            unit_source_type: :galaxy,
            unit_source: 'https://galaxy.example.com',
            unit_versions: unit_versions
          )
        end
      end
    end
  end
end
