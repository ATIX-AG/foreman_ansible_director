# frozen_string_literal: true

collection @ansible_variables

node(&:render_for_api)
