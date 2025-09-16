# frozen_string_literal: true

module Actions
  module ForemanAnsibleDirector
    module Base
      class AnsibleDirectorAction < Actions::EntryAction
        def queue
          ::ForemanAnsibleDirector::DYNFLOW_QUEUE
        end

        def task_output
          return output if Rails.env.development?
          # TODO: Change default output so something sensible
          humanized_name
        end

        def humanized_name
          "#{::ForemanAnsibleDirector::Constants::PLUGIN_NAME.camelize}: #{self.class.name}"
        end
      end
    end
  end
end
