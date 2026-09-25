# frozen_string_literal: true

module ForemanAnsibleDirector
  module Concerns
    module OrganizationCreatorExtensions
      def create!
        super
        create_ansible_director_product
      end

      private

      def create_ansible_director_product
        return if ::Katello::Product.where(
          name: ::ForemanAnsibleDirector::Constants::EE_STAGING_PRODUCT_NAME,
          organization: @organization
        ).exists?

        product = ::Katello::Product.new(name: ::ForemanAnsibleDirector::Constants::EE_STAGING_PRODUCT_NAME)
        ::ForemanTasks.sync_task(::Actions::Katello::Product::Create, product, @organization)
      end
    end
  end
end
