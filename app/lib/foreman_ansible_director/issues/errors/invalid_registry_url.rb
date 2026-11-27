# frozen_string_literal: true

module ForemanAnsibleDirector
  module Issues
    module Errors
      class InvalidRegistryURL < BaseError
        def initialize(container_image_url:)
          @container_image_url = container_image_url
          super
        end

        def title
          _('Invalid container image url')
        end

        def message
          <<~MESSAGE
            Container image URL "#{@container_image_url}" is invalid.
            It must include a scheme ("http://" or "https://"), a repository and a tag.
            Example: "https://registry.example.com/repository/container-image:1.2.3".
          MESSAGE
        end

        def status_code
          422
        end
      end
    end
  end
end
