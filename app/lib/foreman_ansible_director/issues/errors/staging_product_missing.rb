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
          _('Katello execution environment product missing')
        end

        def message
          <<~MESSAGE
            The Katello product used to stage built execution environment images does not exist in this organization.
            Ensure a product with the exact name "#{::ForemanAnsibleDirector::Constants::EE_STAGING_PRODUCT_NAME}"
            exists in organization "#{@execution_environment.organization.title}".
            Rebuild execution environment "#{@execution_environment.name}" after ensuring the product exists.
          MESSAGE
        end

        def status_code
          404
        end
      end
    end
  end
end
