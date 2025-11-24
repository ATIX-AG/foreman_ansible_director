FactoryBot.define do

  factory :ansible_variable, parent: :lookup_key, class: '::ForemanAnsibleDirector::AnsibleVariable' do
    sequence(:key) { |n| "variable_#{n}" }

    trait :for_ansible_role do
      association :ownable, factory: :ansible_role
    end

    trait :for_collection_role do
      association :ownable, factory: :ansible_collection_role
    end
  end

end