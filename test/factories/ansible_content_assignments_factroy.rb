FactoryBot.define do

  factory :ansible_content_assignment do
    association :consumable, factory: :ansible_collection_role
    association :assignable, factory: :lifecycle_environment

    trait :with_collection_role do
      association :consumable, factory: :ansible_collection_role
    end

    trait :with_ansible_role do
      association :consumable, factory: :ansible_role
    end
  end

  factory :ansible_content_assignment_collection_role do
    association :ansible_content_assignment
    association :ansible_collection_role
  end
end