# frozen_string_literal: true

module ForemanAnsibleDirector
  module Issues
    module Errors
      class StagingProductMissing < BaseError
        def initialize(execution_environment:)
          @execution_environment = execution_environment
          super
        end

        def title
          _('Product for Execution Environment missing')
        end

        def message
          <<~MESSAGE
            There is no product to distribute the built Execution Environment images in your organization.
            Ensure a product named "#{::ForemanAnsibleDirector::Constants::EE_STAGING_PRODUCT_NAME}"
            exists in organization "#{@execution_environment.organization.title}".
            Rebuild your Ansible Execution Environment "#{@execution_environment.name}" after creating the product.
          MESSAGE
        end

        def status_code
          404
        end
      end
    end
  end
end
