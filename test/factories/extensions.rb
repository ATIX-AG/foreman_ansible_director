FactoryBot.modify do
  factory :feature do
    trait :ansible_director do
      name { 'Ansible_Director' }
    end
  end

  factory :smart_proxy do
    trait :ansible_director do
      features { [FactoryBot.create(:feature, :ansible_director)] }
    end
  end
end