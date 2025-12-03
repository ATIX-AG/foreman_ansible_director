FactoryBot.define do

  factory :lifecycle_environment_path, class: "::ForemanAnsibleDirector::LifecycleEnvironmentPath" do
    sequence(:name) { |n| "lifecycle_env_path_#{n}" }
    association :organization

    trait :with_root do
      association :root_environment, factory: :lifecycle_environment
    end
  end

  factory :lifecycle_environment, class: "::ForemanAnsibleDirector::LifecycleEnvironment" do
    sequence(:name) { |n| "lifecycle_env_#{n}" }
    position { 1 }
    association :organization
    association :lifecycle_environment_path

    trait :with_execution_environment do
      association :execution_environment
    end

    trait :with_content_snapshot do
      association :content_snapshot
    end

    trait :with_parent do
      association :parent, factory: :lifecycle_environment
      position { 0 }
    end

    trait :with_child do
      association :child, factory: :lifecycle_environment
      position { 2 }
    end

    trait :protected_environment do
      protected { true }
    end
  end

  factory :lifecycle_environment_content_unit_version, class: "::ForemanAnsibleDirector::LifecycleEnvironmentContentUnitVersion" do
    association :lifecycle_environment
    association :content_unit_version
  end

  factory :content_snapshot, class: "::ForemanAnsibleDirector::ContentSnapshot" do
    references { 0 }
    sequence(:content_hash) { |n| Digest::SHA2.hexdigest("snapshot_#{n}")[0, 8] }
  end

  factory :content_snapshot_content_unit_version, class: "::ForemanAnsibleDirector::ContentSnapshotContentUnitVersion" do
    association :content_snapshot
    association :content_unit_version
  end

end