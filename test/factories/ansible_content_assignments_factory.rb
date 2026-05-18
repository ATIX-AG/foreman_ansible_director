FactoryBot.define do

  factory :ansible_content_assignment, class: '::ForemanAnsibleDirector::AnsibleContentAssignment' do
    association :consumable, factory: :host

    assignable_type { 'ForemanAnsibleDirector::AnsibleCollectionRole' }
    assignable_namespace { "ansible" }
    assignable_name { "posix" }
    assignable_role_name { "user" }
    subtractive { false }

    trait :for_role do
      assignable_type { 'ForemanAnsibleDirector::AnsibleRole' }
      assignable_namespace { "acme" }
      assignable_name { "my_role" }
      assignable_role_name { nil }
    end

    trait :subtractive do
      subtractive { true }
    end
  end
end