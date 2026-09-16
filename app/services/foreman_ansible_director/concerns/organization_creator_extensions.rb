# frozen_string_literal: true

module ForemanAnsibleDirector
  module Concerns
    module OrganizationCreatorExtensions
      def seed!
        super
        create_ansible_director_product
      end

      private

      def create_ansible_director_product
        ::Katello::Product.where(name: 'ansible_director',
                                 organization: @organization,
                                 provider: @anonymous_provider).first_or_create!
      end
    end
  end
end
