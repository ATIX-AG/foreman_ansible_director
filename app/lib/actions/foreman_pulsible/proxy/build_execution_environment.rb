# frozen_string_literal: true

module Actions
  module ForemanPulsible
    module Proxy
      class BuildExecutionEnvironment < Actions::EntryAction
        input_format do
          param :proxy_id, Integer
        end

        output_format do
        end

        def plan(args)
        end
      end
    end
  end
end
