class PulsibleModel < ApplicationRecord
  self.abstract_class = true
  self.table_name_prefix = 'pulsible_'
end