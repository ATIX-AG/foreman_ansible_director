# frozen_string_literal: true

module ForemanAnsibleDirector
  module Errors
    module Helpers
      def app_error_for(error_code, title_args: {}, description_args: {}, args: nil)
        ::ForemanAnsibleDirector::Errors::ApplicationError.new(error_code, title_args, description_args, args)
      end

      class ErrorScope
        def initialize(errors)
          @errors = errors
        end

        def try(&block)
          @try_block = block
          execute
        end

        def execute
          @try_block&.call
        rescue ::ForemanAnsibleDirector::Errors::ApplicationError => e
          # Disabling rubocop here, because the "thing" we want to do with the error is not implemented yet
          # rubocop:disable Style/GuardClause
          if @errors.include?(e.error_code)
            # TODO: do something with expected error
            raise e
          else
            raise ::ForemanAnsibleDirector::Errors::UnexpectedError
          end
          # rubocop:enable Style/GuardClause
        rescue StandardError
          raise ::ForemanAnsibleDirector::Errors::UnknownError
        end
      end

      class ErrorScopeRescue
        def initialize(errors)
          @errors = errors
        end

        def try(&block)
          @try_block = block
          self
        end

        def catch(&block)
          @catch_block = block
          execute
        end

        def execute
          @try_block&.call
        rescue ::ForemanAnsibleDirector::Errors::ApplicationError => e
          @catch_block&.call(e)
          if @errors.include?(e.error_code)
            # TODO: do something with expected error
            raise e
          end
        rescue StandardError
          raise ::ForemanAnsibleDirector::Errors::UnknownError
        end
      end

      def error_scope_rescue(errors)
        result = ErrorScopeRescue.new(errors)
        yield(result) if block_given?
        result
      end

      def error_scope(errors)
        result = ErrorScope.new(errors)
        yield(result) if block_given?
        result
      end
    end
  end
end
