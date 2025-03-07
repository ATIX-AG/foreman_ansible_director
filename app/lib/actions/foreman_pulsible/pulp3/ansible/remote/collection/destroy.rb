# frozen_string_literal: true
module Actions
  module ForemanPulsible
    module Pulp3
      module Ansible
        module Remote
          module Collection
            class Destroy < ::Actions::ForemanPulsible::Base::PulsibleAction
              include Dynflow::Action::Polling

              input_format do
                param :collection_remote_href, String, required: true
              end

              output_format do
                param :collection_remote_destroy_response, Hash
              end

              def invoke_external_task
                response = ::ForemanPulsible::Pulp3::Ansible::Remote::Collection::Destroy.new(input[:collection_remote_href]).request
                output.update(collection_remote_destroy_response: response)
                nil
              end

              def done?
                output[:task]&.[](:progress) == 1
              end

              def poll_external_task
                collection_remote_destroy_task = output&.[](:collection_remote_destroy_response)&.[](:task)
                t = ::ForemanPulsible::Pulp3::Core::Task::Status.new(collection_remote_destroy_task).request
                t = ::Parsers::Pulp3::Core::Task::Status.new(t)

                {progress: t.progress}
              end

              def task_output
                output[:collection_remote_destroy_response]
              end
            end
          end
        end
      end
    end
  end
end