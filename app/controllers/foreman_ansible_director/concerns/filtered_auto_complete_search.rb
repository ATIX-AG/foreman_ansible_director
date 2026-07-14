# frozen_string_literal: true

module ForemanAnsibleDirector
  module Concerns
    module FilteredAutoCompleteSearch
      extend ActiveSupport::Concern
      OPERATORS = %w[and or not has].freeze

      def auto_complete_search
        items = resource_class.where(id: index_relation.select(:id)).complete_for(
          params[:search],
          controller: controller_name
        )

        items = items.map do |item|
          category = OPERATORS.include?(item.to_s.sub(/^.*\s+/, '')) ? _('Operators') : ''
          part = item.to_s.sub(/^.*\b(and|or)\b/i) { |match| match.sub(/^.*\s+/, '') }
          completed = item.to_s.chomp(part)
          { completed: CGI.escapeHTML(completed), part: CGI.escapeHTML(part), label: item, category: category }
        end
      rescue ScopedSearch::QueryNotSupported => e
        items = [{ error: e.to_s }]
      ensure
        render json: items
      end

      private

      def index_relation
        resource_scope
      end
    end
  end
end
