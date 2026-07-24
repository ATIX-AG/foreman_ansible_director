# frozen_string_literal: true

CommonParameter.without_auditing do
  params = [
    { name: 'ansible_director_configure_after_provisioning', key_type: 'boolean', value: true },
    { name: 'ansible_director_configuration_delay', key_type: 'integer', value: 600 },
  ]

  params.each { |param| CommonParameter.find_or_create_by(param) }
end
