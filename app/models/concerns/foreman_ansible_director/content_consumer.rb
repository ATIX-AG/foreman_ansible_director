
module ForemanAnsibleDirector
  module ContentConsumer
    extend ActiveSupport::Concern

    included do
      has_many :ansible_content_assignments, as: :assignable, dependent: :destroy
    end
  end
end
