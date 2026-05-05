# frozen_string_literal: true

module ForemanAnsibleDirector
  module RequestCtx
    class RequestContext
      class << self
        def current
          Thread.current[:ansible_director_request_context]
        end

        def with_context(context)
          old = Thread.current[:ansible_director_request_context]
          Thread.current[:ansible_director_request_context] = context
          yield
        ensure
          Thread.current[:ansible_director_request_context] = old
        end
      end

      attr_reader :errors, :warnings, :created, :updated, :deleted

      def initialize(coincidence_id)
        @coincidence_id = coincidence_id
        @errors = []
        @warnings = []
        @created = []
        @updated = []
        @deleted = []
      end

      def response_status
        return 'error' if @errors.any?
        return 'warning' if @warnings.any?
        'success'
      end

      def response_warnings
        @warnings.map(&:render_for_response)
      end

      def response_errors
        @errors.map(&:render_for_response)
      end

      def response_created
        @created.group_by { |k| k.class.name.demodulize.underscore }.transform_values do |items|
          items.map do |item|
            {
              id: item.id,
            }
          end
        end
      end

      def response_updated
        @updated.group_by { |k| k.class.name.demodulize.underscore }.transform_values do |items|
          items.map do |item|
            {
              id: item.id,
            }
          end
        end
      end

      def response_deleted
        @deleted.group_by { |k| k.class.name.demodulize.underscore }.transform_values do |items|
          items.map do |item|
            {
              id: item.id,
            }
          end
        end
      end

      def add_error(error)
        @errors << error
      end

      def add_warning(warning)
        @warnings << warning
      end

      def add_created(record)
        ::ForemanAnsibleDirector::Logging::CrudLogger.log_record_creation(record)
        @created << record
      end

      def add_updated(record)
        ::ForemanAnsibleDirector::Logging::CrudLogger.log_record_update(record)
        @updated << record
      end

      def add_deleted(record)
        ::ForemanAnsibleDirector::Logging::CrudLogger.log_record_deletion(record)
        @deleted << record
      end
    end
  end
end
