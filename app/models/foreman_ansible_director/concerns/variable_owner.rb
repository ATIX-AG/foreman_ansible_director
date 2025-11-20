# frozen_string_literal: true

module ForemanAnsibleDirector
  module Concerns
    module VariableOwner
      extend ActiveSupport::Concern

      included do
        has_many :ansible_variables, as: :ownable, dependent: :destroy
      end
    end
  end
end
