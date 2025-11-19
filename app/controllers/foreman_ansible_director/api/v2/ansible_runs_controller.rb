# frozen_string_literal: true

require 'securerandom'

module Api
  module V2
    class AnsibleRunsController < AnsibleDirectorApiController
      before_action :find_target_host, only: %i[run_all]

      def run_all
        playbook = Generators::PlaybookGenerator.generate @target_host
        inventory = Generators::InventoryGenerator.generate @target_host

        content = Generators::ContentGenerator.generate @target_host

        ForemanTasks.async_task(
          ::Actions::ForemanAnsibleDirector::Proxy::RunPlaybook,
          proxy_task_id: SecureRandom.uuid,
          playbook: playbook,
          inventory: inventory,
          content: content,
          execution_environment: 'centos9-katello-devel-stable.example.com:4321/ansibleng/13'
        )
      end

      private

      def find_target_host
        @target_host = Host.find(params[:host_id])
      end
    end
  end
end
