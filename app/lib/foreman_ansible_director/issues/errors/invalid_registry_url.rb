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
          _('Invalid container registry url')
        end

        def message
          <<~MESSAGE
            Container registry URL "#{@container_image_url}" is invalid.
            It must include an http(s):// scheme, a repository and a tag (e.g. "https://registry.io/repo/image:latest").
          MESSAGE
        end

        def status_code
          422
        end
      end
    end
  end
end
