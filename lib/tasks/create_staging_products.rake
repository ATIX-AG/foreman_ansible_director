# frozen_string_literal: true

namespace :foreman_ansible_director do
  desc 'Create the execution environment staging product for organizations that are missing it'
  task create_staging_products: ['dynflow:client', 'katello:check_ping'] do
    User.as_anonymous_admin do
      Organization.find_each do |organization|
        next unless organization.created_in_katello?

        if ::Katello::Product.where(
          name: ::ForemanAnsibleDirector::Constants::EE_STAGING_PRODUCT_NAME,
          organization: organization
        ).exists?
          puts "Organization '#{organization.name}' already has the staging product, skipping."
          next
        end

        anonymous_provider = organization.anonymous_provider
        unless anonymous_provider
          puts "Organization '#{organization.name}' has no anonymous provider, skipping."
          next
        end

        puts "Creating staging product for organization '#{organization.name}'."
        product = ::Katello::Product.new(name: ::ForemanAnsibleDirector::Constants::EE_STAGING_PRODUCT_NAME)
        begin
          ::ForemanTasks.sync_task(::Actions::Katello::Product::Create, product, organization)
        rescue StandardError => e
          puts "Failed to create staging product for organization '#{organization.name}': #{e.message}"
        end
      end
    end
  end
end
