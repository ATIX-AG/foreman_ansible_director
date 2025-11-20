# frozen_string_literal: true

module ForemanAnsibleDirector
  module Concerns
    module LookupKeysExtensions
      extend ActiveSupport::Concern

      included do
        belongs_to :ownable, polymorphic: true, optional: true
      end
    end
  end
end
