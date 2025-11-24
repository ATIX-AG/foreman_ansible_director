FactoryBot.define do

  factory :content_unit, class: "ForemanAnsibleDirector::ContentUnit" do
    sequence(:name) { |n| "name_#{n}" }
    sequence(:namespace) { |n| "namespace_#{n}" }
    sequence(:source) { |n| "https://galaxy.ansible.com/#{n}" }
    association :organization
  end

  factory :ansible_collection, parent: :content_unit, class: 'ForemanAnsibleDirector::AnsibleCollection' do
    sequence(:name) { |n| "collection_#{n}" }
    sequence(:namespace) { |n| "namespace_#{n}" }
    association :organization
  end

  factory :ansible_role, parent: :content_unit, class: 'ForemanAnsibleDirector::AnsibleRole' do
    sequence(:name) { |n| "role_#{n}" }
    sequence(:namespace) { |n| "namespace_#{n}" }
  end

  factory :content_unit_version, class: 'ForemanAnsibleDirector::ContentUnitVersion' do
    sequence(:version) { |n| "#{n}.0.0" }
    association :versionable, factory: :ansible_collection

    trait :for_collection do
      association :versionable, factory: :ansible_collection
    end

    trait :for_role do
      association :versionable, factory: :ansible_role
    end
  end

  factory :ansible_collection_role, class: 'ForemanAnsibleDirector::AnsibleCollectionRole' do
    sequence(:name) { |n| "collection_role_#{n}" }
    association :ansible_collection_version, factory: :content_unit_version, strategy: :build

    after(:build) do |role| if role.ansible_collection_version
                              role.ansible_collection_version.versionable_type = 'ForemanAnsibleDirector::AnsibleCollection'
                              role.ansible_collection_version.versionable ||= build(:ansible_collection)
                            end
    end
  end

end