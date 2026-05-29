# frozen_string_literal: true

module ForemanAnsibleDirector
  module Actions
    module ConsistencyCheck
      module Destroy
        class CollectionRemotes < ::ForemanAnsibleDirector::Actions::Base::AnsibleDirectorAction
          input_format do
            param :unreferenced_collection_remote_hrefs, Array
          end

          output_format do
          end

          def plan(args)
            unreferenced_collection_remote_hrefs = args[:unreferenced_collection_remote_hrefs]

            unreferenced_collection_remote_hrefs.each do |collection_remote_href|
              plan_action(
                ::ForemanAnsibleDirector::Actions::Pulp3::Ansible::Remote::Collection::Destroy,
                collection_remote_href: collection_remote_href
              )
            end
          end
        end
      end
    end
  end
end
