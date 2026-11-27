# frozen_string_literal: true

module ForemanAnsibleDirector
  module Issues
    module Errors
      class UnexpectedRepositoryCount < BaseError
        def initialize(execution_environment:,
                       image_name:)
          @execution_environment = execution_environment
          @image_name = image_name
          super
        end

        def title
          "Unexpected repository count for Execution Environment \"#{@execution_environment.name}\""
        end

        def message
          <<~MESSAGE
            The repository #{@image_name} contains more than one container image which matches 
            #{@execution_environment.name}.
            This is unexpected and may only happen through a manual edit and sync of the #{@image_name} repository.

            Inspect the contents of repository #{@image_name} in the product #{::ForemanAnsibleDirector::Constants::EE_STAGING_PRODUCT_NAME}
            and delete it manually.
            Afterwards, try deleting Execution Environment \"#{@execution_environment.name}\" again."
          MESSAGE
        end

      end
    end
  end
end
