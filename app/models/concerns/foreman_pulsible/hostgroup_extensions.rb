module ForemanPulsible
  module HostgroupExtensions
    extend ActiveSupport::Concern
    included do
      include ForemanPulsible::ContentConsumer
    end
  end
end
