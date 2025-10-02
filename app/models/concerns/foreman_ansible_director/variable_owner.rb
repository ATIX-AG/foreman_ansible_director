
module ForemanAnsibleDirector
  module VariableOwner
    extend ActiveSupport::Concern

    included do
      has_many :ansible_variables, as: :ownable, dependent: :destroy
    end
  end
end
