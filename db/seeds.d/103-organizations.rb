# frozen_string_literal: true

# The Katello seed 102-organizations must run before this.
# Since seed files are sorted in ForemanSeeder, this file must be named such that it is ran after 102-organizations

Organization.without_auditing do
  Organization.find_each do |org|
    User.as_anonymous_admin do
      anonymous_provider = Katello::Provider.where(
        name: Katello::Provider::ANONYMOUS,
        provider_type: Katello::Provider::ANONYMOUS,
        organization: org
      ).first!
      ::Katello::Product.where(
        name: ::ForemanAnsibleDirector::Constants::EE_STAGING_PRODUCT_NAME,
        organization: org,
        provider: anonymous_provider
      ).first_or_create!
    end
  end
end
