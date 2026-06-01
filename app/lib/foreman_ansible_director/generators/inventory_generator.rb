# frozen_string_literal: true

module ForemanAnsibleDirector
  module Generators
    class InventoryGenerator
      class << self
        def generate(host:,
                     ansible_user:)
          {
            "#{host.name}": {
              hosts: {
                "#{host.fqdn}": {
                  ansible_user: ansible_user,
                },
              },
            },
          }
        end
      end
    end
  end
end
