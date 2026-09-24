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
        ::Katello::Product.where(
          name: ::ForemanAnsibleDirector::Constants::EE_STAGING_PRODUCT_NAME,
          organization: @organization,
          provider: @anonymous_provider
        ).first_or_create!
      end
    end
  end
end
