# frozen_string_literal: true

FactoryBot.define do
  factory :ansible_variable_binding, class: '::ForemanAnsibleDirector::AnsibleVariableBinding' do
    sequence(:variable_name) { |n| "binding_variable_#{n}" }
    data_type { 'string' }
    raw_value { 'binding_value' }
    query { :local }
    transformer { :static }
    query_data { {} }
    transformer_data { {} }
    organization

    # Default: consumable is a Host
    association :consumable, factory: :host

    # Default: assignable is an AnsibleCollectionRole
    assignable_type { 'ForemanAnsibleDirector::AnsibleCollectionRole' }
    assignable_namespace { 'test_namespace' }
    assignable_name { 'test_role_name' }
    assignable_role_name { 'test_role' }

    trait :for_ansible_role do
      assignable_type { 'ForemanAnsibleDirector::AnsibleRole' }
      assignable_namespace { 'acme' }
      assignable_name { 'my_role' }
      assignable_role_name { nil }
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
