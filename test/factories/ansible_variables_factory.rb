# frozen_string_literal: true

FactoryBot.define do
  factory :ansible_variable, class: '::ForemanAnsibleDirector::AnsibleVariable' do
    sequence(:name) { |n| "variable_#{n}" }
    data_type { 'string' }
    raw_value { 'default_value' }
    query { :local }
    transformer { :static }
    query_data { {} }
    transformer_data { {} }
    organization

    trait :for_ansible_role do
      association :ownable, factory: :ansible_role
    end

    trait :for_collection_role do
      association :ownable, factory: :ansible_collection_role
    end

    trait :with_integer_type do
      data_type { 'integer' }
      raw_value { "---\n42" }
    end

    trait :with_boolean_type do
      data_type { 'boolean' }
      raw_value { "---\ntrue" }
    end

    trait :with_dict_type do
      data_type { 'dictionary' }
      raw_value { "---\nkey1: item1\nkey2: item2" }
    end

    trait :with_array_type do
      data_type { 'array' }
      raw_value { "---\n- item1\n- item2" }
    end
  end
end
