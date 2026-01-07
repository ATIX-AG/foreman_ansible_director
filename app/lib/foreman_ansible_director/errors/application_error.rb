# frozen_string_literal: true

module ForemanAnsibleDirector
  module Errors
    class ApplicationError < StandardError
      attr_reader :error_code, :title, :description, :response_status, :docs_link

      def initialize(error_code, title_args, description_args, args)
        if args
          title_args.merge!(args)
          description_args.merge!(args)
        end
        error_object = ::ForemanAnsibleDirector::Errors.error_object(error_code, title_args, description_args)
        @error_code = error_code
        @response_status = error_object[:response_status]
        @title = error_object[:title]
        @description = error_object[:description]
        @docs_link = error_object[:docs_link]
        super()
      end
    end

    def self.error_object(error_code, title_args, description_args)
      raw = ::ForemanAnsibleDirector::Errors::ERROR_OBJECTS[error_code]

      {
        response_status: raw[:response_status],
        title: raw[:title] % title_args,
        description: raw[:description] % description_args,
        docs_link: raw[:docs_link],
      }
    end

    def self.env(message)
      # ^ADR-(?<error_source>\d{3})-(?<source_id>\d{3})-(?<failure_source>\d{3})-(?<failure_id>\d{3})$

      if Rails.env.development?
        return message # TODO: This should return more verbose output at some point
      end
      message
    end

    ERROR_OBJECTS = HashWithIndifferentAccess.new({})
  end
end
