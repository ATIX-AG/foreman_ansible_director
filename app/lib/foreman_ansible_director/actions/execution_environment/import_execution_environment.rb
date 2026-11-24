# frozen_string_literal: true

module ForemanAnsibleDirector
  module Actions
    module ExecutionEnvironment
      class ImportExecutionEnvironment < ::ForemanAnsibleDirector::Actions::Base::AnsibleDirectorAction
        include Dynflow::Action::V2::WithSubPlans

        input_format do
          param :execution_environment_id
          param :katello_repository_options, Hash, required: true
        end

        def plan(args)
          execution_environment_id = args[:execution_environment_id]
          katello_repository_options = args[:katello_repository_options]

          staging_product = ::Katello::Product.find_by(id: katello_repository_options[:product_id])
          root_repository = staging_product.add_repo(katello_repository_options)

          plan_action(::Actions::Katello::Repository::CreateRoot, root_repository)
          plan_self(
            repository_name: katello_repository_options[:name],
            execution_environment_id: execution_environment_id
          )
        end

        def create_sub_plans
          root_repository = ::Katello::RootRepository.find_by!(name: input[:repository_name])

          if (repositories = root_repository.repositories).length != 1
            raise "Unexpected repository count. Please delete #{root_repository.name} and try again."
          end

          trigger(::Actions::Katello::Repository::Sync, repositories.first)
        end

        def total_count
          1
        end

        # I am overloading this method because the original method is responsible for aborting the action if a sub-plan
        # failed. In this case, I want the error handling to be done by the triggering action.
        def check_for_errors!
        end
      end
    end
  end
end
