# frozen_string_literal: true

module ForemanAnsibleDirector
  module Errors
    class UnknownError < StandardError
      def initialize
        super('An unknown error has occurred. This is likely a bug you should report.')
      end
    end
  end
end
