# frozen_string_literal: true

require 'pulpcore_client'
module ForemanAnsibleDirector
  module Pulp3
    class BaseClient
      class << self
        def pulp3_configuration(config_class)
          # TODO: parameterize
          url = 'https://centos9-katello-devel-stable.example.com'
          k = URI.parse(url)
          config_class.new do |config|
            uri = k
            config.host = uri.host
            config.scheme = uri.scheme
            config.ssl_ca_file = ::ForemanAnsibleDirector::Cert::Certs.ca_cert_file
            config.ssl_client_cert = ::ForemanAnsibleDirector::Cert::Certs.ssl_client_cert
            config.ssl_client_key = ::ForemanAnsibleDirector::Cert::Certs.ssl_client_key
          end
        end

        def core_api_client
          PulpcoreClient::ApiClient.new(pulp3_configuration(PulpcoreClient::Configuration))
        end

        def ansible_api_client
          PulpAnsibleClient::ApiClient.new(pulp3_configuration(PulpAnsibleClient::Configuration))
        end
      end
    end
  end
end
