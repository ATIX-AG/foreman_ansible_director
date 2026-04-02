# frozen_string_literal: true

module ForemanAnsibleDirector
  module Generators
    class InventoryGenerator
      class << self
        def generate(host)
          {
            "#{host.name}": {
              hosts: {
                "#{host.fqdn}": {
                  ansible_user: 'root',
                  ansible_ssh_private_key_file: '/runner/.ssh/id_rsa_foreman_proxy',
                },
              },
            },
          }
        end
      end
    end
  end
end
