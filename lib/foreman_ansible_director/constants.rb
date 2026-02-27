# frozen_string_literal: true

module ForemanAnsibleDirector
  module Constants
    PLUGIN_NAME = 'foreman_ansible_director'
    PLUGIN_VERSION = '0.3.4'

    DEFAULT_GALAXY_URL = 'https://galaxy.ansible.com/'
    DEFAULT_ANSIBLE_VERSION = '2.19.3'

    # This can be used to prefix the generated name of a pulp object with a string
    # If a dash is desired between the name and prefix, it must be added here!
    # I.e.: prefix-name -> PULP_OBJECT_NAME_PREFIX = 'prefix-'
    PULP_OBJECT_NAME_PREFIX = ''
  end
end
