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
                },
              },
            },
          }
        end
      end
    end
  end
end
