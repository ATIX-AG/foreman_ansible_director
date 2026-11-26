# frozen_string_literal: true

CommonParameter.without_auditing do
  params = [
    { name: 'ansible_director_default_ee_id', key_type: 'integer', value: nil },
  ]

  params.each { |param| CommonParameter.find_or_create_by(param) }
end
