# frozen_string_literal: true

class AdRemoveDefaultEeSettings < ActiveRecord::Migration[6.1]
  def change
    Setting.where(name: 'ansible_director_default_ee_internal').destroy_all
    Setting.where(name: 'ansible_director_default_ee_rex').destroy_all
  end
end
