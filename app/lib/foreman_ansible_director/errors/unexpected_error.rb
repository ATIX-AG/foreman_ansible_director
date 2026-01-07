# frozen_string_literal: true

module ForemanAnsibleDirector
  module Errors
    class UnexpectedError < StandardError
      def initialize
        super('An unexpected error has occurred.')
      end
    end
  end
end
