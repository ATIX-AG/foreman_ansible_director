require 'foreman_ansible_director_test_helper'

module ForemanAnsibleDirectorTests
  module Services
    module Unit
      class ImportVerifierTest < ForemanAnsibleDirectorTestCase
        let(:requirements) do
          YAML.dump(
            'collections' => [
              { 'name' => 'theforeman.operations', 'version' => '1.0.0' },
              { 'name' => 'theforeman.foreman', 'version' => '2.0.0' },
            ]
          )
        end

        describe '#missing_collections' do
          test 'returns an empty array when every requested collection/version was imported' do
            imported_results = [
              { namespace: 'theforeman', name: 'operations', version: '1.0.0' },
              { namespace: 'theforeman', name: 'foreman', version: '2.0.0' },
            ]

            verifier = ::ForemanAnsibleDirector::Pulp3::Ansible::Content::Collection::ImportVerifier.new(
              requirements, imported_results
            )

            assert_empty verifier.missing_collections
          end

          test 'returns the requested collections that are missing from the imported results' do
            imported_results = [
              { namespace: 'theforeman', name: 'operations', version: '1.0.0' },
            ]

            verifier = ::ForemanAnsibleDirector::Pulp3::Ansible::Content::Collection::ImportVerifier.new(
              requirements, imported_results
            )

            assert_equal [{ 'name' => 'theforeman.foreman', 'version' => '2.0.0' }], verifier.missing_collections
          end

          test 'returns the requested collection when only a different version was imported' do
            imported_results = [
              { namespace: 'theforeman', name: 'operations', version: '1.0.0' },
              { namespace: 'theforeman', name: 'foreman', version: '1.9.0' },
            ]

            verifier = ::ForemanAnsibleDirector::Pulp3::Ansible::Content::Collection::ImportVerifier.new(
              requirements, imported_results
            )

            assert_equal [{ 'name' => 'theforeman.foreman', 'version' => '2.0.0' }], verifier.missing_collections
          end

          test 'is satisfied by any version when the requirement has no version pinned' do
            unpinned_requirements = YAML.dump('collections' => [{ 'name' => 'theforeman.operations' }])
            imported_results = [{ namespace: 'theforeman', name: 'operations', version: '1.0.0' }]

            verifier = ::ForemanAnsibleDirector::Pulp3::Ansible::Content::Collection::ImportVerifier.new(
              unpinned_requirements, imported_results
            )

            assert_empty verifier.missing_collections
          end

          test 'treats a nil imported results list as nothing being imported' do
            verifier = ::ForemanAnsibleDirector::Pulp3::Ansible::Content::Collection::ImportVerifier.new(
              requirements, nil
            )

            assert_equal 2, verifier.missing_collections.size
          end
        end
      end
    end
  end
end
